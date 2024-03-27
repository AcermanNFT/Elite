const Express = require('express');
const express = Express();
const fs = require('fs');
const log = require("../utils/base/log.js");
const functions = require("../utils/functions/functions.js");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '..', 'config', '.env') });

function checkAndCreateProfile(accountId) {
    const profilePath = getProfilePath(accountId);
    if (!fs.existsSync(profilePath)) {
        const templatePath = getTemplatePath();
        fs.copyFileSync(templatePath, profilePath);
    }
}

function loadConfig(accountId) {
    const profilePath = getProfilePath(accountId);
    if (!fs.existsSync(profilePath)) {
        throw new Error(`Profile not found for account ${accountId}`);
    }
    return JSON.parse(fs.readFileSync(profilePath));
}

function loadProfile(profileId) {
    const profilePath = getTemplateProfilePath(profileId);
    if (!fs.existsSync(profilePath)) {
        throw new Error(`Profile template not found for profileId ${profileId}`);
    }
    return JSON.parse(fs.readFileSync(profilePath));
}
function saveConfig(directory, accountId, config) {
    const profilePath = getProfilePath(directory, accountId);
    console.log("Profile Path:", profilePath); // Log the profile path
    fs.writeFileSync(profilePath, JSON.stringify(config, null, 2));
}

function getProfilePath(accountId) {
    return `${process.env.directory}/profiles/${accountId}.json`;
}

function getTemplatePath() {
    return `${process.env.directory}/athena/config.json`;
}

function getTemplateProfilePath(profileId) {
    return `${process.env.directory}/athena/profile_${profileId}.json`;
}

function createProfileResponse(profileData, profileId, rvn) {
    return {
        profileRevision: rvn ? parseInt(rvn) + 1 : 1,
        profileId: profileId,
        profileChangesBaseRevision: parseInt(rvn) || 1,
        profileChanges: [{
            changeType: 'fullProfileUpdate',
            profile: profileData
        }],
        profileCommandRevision: rvn ? parseInt(rvn) + 1 : 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1
    };
}

function createEmptyResponse(profileId, rvn) {
    return {
        profileRevision: rvn ? parseInt(rvn) : 1,
        profileId: profileId,
        profileChangesBaseRevision: parseInt(rvn) || 1,
        profileChanges: [],
        profileCommandRevision: rvn ? parseInt(rvn) : 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1
    };
}

function createProfileError(errorCode, errorMessage, numericErrorCode, originatingService, intent, messageVars) {
    return {
        errorCode: errorCode,
        errorMessage: errorMessage,
        numericErrorCode: numericErrorCode,
        originatingService: originatingService,
        messageVars: messageVars || undefined,
        intent: intent || 'prod'
    };
}

function createError(errorCode, errorMessage, numericErrorCode, originatingService, intent, messageVars) {
    return {
        errorCode: errorCode,
        errorMessage: errorMessage,
        numericErrorCode: numericErrorCode,
        originatingService: originatingService,
        messageVars: messageVars || undefined,
        intent: intent || 'prod'
    };
}

function createProfile(accountId, profileData) {
    profileData.accountId = accountId;
    profileData.created = new Date().toISOString();
    profileData.updated = new Date().toISOString();
    return profileData;
}

function createAthenaProfile(config, accountId, profile) {
    return profile;
}

function createCommonCore(config, accountId, profile) {
    if (!profile) {
        profile = {};
    }

    profile._id = accountId;
    profile.accountId = accountId;

    profile.created = new Date().toISOString();
    profile.updated = new Date().toISOString();

    profile.profileId = 'athena';

    if (!profile.items) {
        profile.items = {};
    }

    if (config && config.vbucks !== undefined) {
        profile.items['Currency:MtxPurchased'] = {
            quantity: config.vbucks
        };
    }

    return profile;
}

function createCommonPublic(accountId, profile) {
    if (!profile) {
        profile = {};
    }

    profile.accountId = accountId;
    profile.created = new Date().toISOString();
    profile.updated = new Date().toISOString();
    profile.profileId = 'athena';

    return profile;
}

function createCollections(accountId, profile) {
    if (!profile) {
        profile = {};
    }
    
	profile.accountId = accountId;

	profile.created = new Date().toISOString();
	profile.updated = new Date().toISOString();

	profile.profileId = 'athena';

	return profile;
}

express.post('/fortnite/api/game/v2/profile/:accountId/client/:command', (req, res) => {
    const command = req.params.command;
    const accountId = req.params.accountId;
    const profileId = req.query.profileId;
    const rvn = req.query.rvn;
    checkAndCreateProfile(accountId);
    let config = loadConfig(accountId);
    let profile = loadProfile(profileId);

    switch (command) {
        case 'QueryProfile':
            switch (profileId) {
                case 'collections':
                    res.json(createProfileResponse(
                        createCollections(accountId, profile),
                        profileId
                    ));
                    break;
                case 'athena':
                case 'profile0':
                    res.json(createProfileResponse(
                        createAthenaProfile(config, accountId, profile),
                        profileId
                    ));
                    break;
                case 'creative':
                    res.json(createProfileResponse(
                        createCreative(accountId, profile),
                        profileId
                    ));
                    break;
                    case 'common_core':
                        res.json(createProfileResponse(
                            createCommonCore(config, accountId, profile), 
                            profileId
                        ));
                        break;
                case 'common_public':
                    res.json(createProfileResponse(
                        createCommonPublic(accountId, profile),
                        profileId
                    ));
                    break;
                case 'collection_book_schematics0':
                case 'collection_book_people0':
                case 'metadata':
                case 'theater0':
                case 'outpost0':
                case 'campaign':
                    res.json(createProfileResponse([], profileId));
                    break;
                default:
                    res.json(createProfileError(
                        'errors.com.epicgames.modules.profiles.operation_forbidden',
                        `Unable to find template configuration for profile ${req.query.profileId}`,
                        12813,
                        'fortnite',
                        'prod-live',
                        [req.query.profileId]
                    ));
                    break;
            }
            break;
        case 'SetMtxPlatform':
            res.json(createProfileResponse([
                { changeType: 'statModified', name: 'current_mtx_platform', value: req.body.platform }
            ], profileId, rvn));
            break;
        case 'VerifyRealMoneyPurchase':
            res.json(createProfileResponse(
                createCommonCore(accountId, profile)
            ), "common_core", rvn);
            break;
            case "ClaimMfaEnabled": {
				break;
			}
        case "RedeemRealMoneyPurchases": // its supposed to be a blank mcp profile iirc ok
            break;
        case 'SetItemFavoriteStatusBatch':
            let index = 0;
            for (let itemId of req.body.itemIds) {
                if (req.body.itemFavStatus[index] === true) {
                    let isAlreadyFavorized = false;
                    for (let item of config.favorites) {
                        if (item.id === req.body.itemIds[index]) {
                            isAlreadyFavorized = true;
                            break;
                        }
                    }
                    if (!isAlreadyFavorized) {
                        config.favorites.push({ id: req.body.itemIds[index] });
                    }
                } else {
                    let index2 = 0;
                    for (let item of config.favorites) {
                        if (item.id === req.body.itemIds[index]) {
                            config.favorites.splice(index2, 1);
                            break;
                        }
                        index2 += 1;
                    }
                }
                index += 1;
            }
            saveConfig(process.env.directory, accountId, config);
            res.json(createProfileResponse(
                createAthenaProfile(config, accountId, profile),
                profileId,
                rvn
            ));
            break;
			case 'SetCosmeticLockerSlot':
				const itemToSlot = req.body.itemToSlot;
				const indexSlot = req.body.slotIndex;
				const slotName = req.body.category;
				const variantUpdates = req.body.variantUpdates;

				switch (slotName) {
					case 'Character':
					case 'Backpack':
					case 'Pickaxe':
					case 'Glider':
					case 'SkyDiveContrail':
					case 'MusicPack':
					case 'LoadingScreen':
						config[slotName].ID = itemToSlot;
						config[slotName].Variants = [{ variants: variantUpdates }];

					case 'Dance':
						config[slotName].ID[indexSlot] = itemToSlot;
						config[slotName].Variants[indexSlot] = [
							{ variants: variantUpdates }
						];

					case 'ItemWrap':
						if (indexSlot != -1) {
							config[slotName].ID[indexSlot] = itemToSlot;
							config[slotName].Variants[indexSlot] = [
								{ variants: variantUpdates }
							];
						}
						else {
							config[slotName].ID[0] = itemToSlot;
							config[slotName].Variants[0] = [{ variants: variantUpdates }];
							config[slotName].ID[1] = itemToSlot;
							config[slotName].Variants[1] = [{ variants: variantUpdates }];
							config[slotName].ID[2] = itemToSlot;
							config[slotName].Variants[2] = [{ variants: variantUpdates }];
							config[slotName].ID[3] = itemToSlot;
							config[slotName].Variants[3] = [{ variants: variantUpdates }];
							config[slotName].ID[4] = itemToSlot;
							config[slotName].Variants[4] = [{ variants: variantUpdates }];
							config[slotName].ID[5] = itemToSlot;
							config[slotName].Variants[5] = [{ variants: variantUpdates }];
							config[slotName].ID[6] = itemToSlot;
							config[slotName].Variants[6] = [{ variants: variantUpdates }];
						}

                        saveConfig(process.env.directory, accountId, config);
						break;
				}
				var newAthena = createAthena(config, accountId, profile);
				res.json(createProfileResponse(newAthena, profileId, rvn));
				break;

			default:
				res.json(
					createError(
						'errors.com.epicgames.modules.profiles.operation_forbidden',
						`Unable to find template configuration for profile ${
							req.query.profileId
						}`,
						12813,
						'fortnite',
						'prod-live',
						[req.query.profileId]
					)
				);
				break;
		}
	}
);

module.exports = express;
