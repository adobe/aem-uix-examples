/* 
* <license header>
*/

import React from 'react'
import { NavLink } from 'react-router-dom'

const getPath = (modelId, fieldId) => {
    return modelId + '/' + fieldId;
}

const processConfig = (config) => {
    const models = config.items.map()
    return config;
}
function SideBar () {
    const config = {
        "items": [
            {
                "id": "L2NvbmYvd2tuZC1zaGFyZWQvc2V0dGluZ3MvZGFtL2NmbS9tb2RlbHMvYWR2ZW50dXJl",
                "path": "/conf/wknd-shared/settings/dam/cfm/models/adventure",
                "name": "Adventure",
                "description": "",
                "created": {
                    "at": "2023-08-02T16:01:34.582+03:00",
                    "by": "admin"
                },
                "modified": {
                    "at": "2022-06-01T10:17:43.668-07:00",
                    "by": "admin"
                },
                "locked": false,
                "status": "enabled",
                "fields": [
                    {
                        "type": "text",
                        "name": "title",
                        "label": "Title",
                        "required": true,
                        "multiple": false,
                        "maxLength": 255,
                        "validationType": "none"
                    },
                    {
                        "type": "text",
                        "name": "slug",
                        "label": "Slug",
                        "description": "A short path to uniquely identify the Adventure. Can be used for pathing in client applications.",
                        "required": true,
                        "multiple": false,
                        "maxLength": 255,
                        "validationType": "custom",
                        "customValidationRegex": "^[a-z0-9\\-_]{5,40}$",
                        "customErrorMessage": "Slug must be at least 5 characters in length, lower case, using only letters and numbers and no spaces. Only special characters that can be used are dashes and underscore.."
                    },
                    {
                        "type": "long-text",
                        "name": "description",
                        "label": "Description",
                        "description": "An overview of the trip.",
                        "required": false,
                        "multiple": false,
                        "mimeType": "text/html"
                    },
                    {
                        "type": "enumeration",
                        "name": "adventureType",
                        "label": "Adventure Type",
                        "required": false,
                        "multiple": true,
                        "hint": "select",
                        "values": [
                            {
                                "key": "Day Trip",
                                "value": "Day Trip"
                            },
                            {
                                "key": "Overnight Trip",
                                "value": "Overnight Trip"
                            },
                            {
                                "key": "Training Session",
                                "value": "Training Session"
                            }
                        ]
                    },
                    {
                        "type": "text",
                        "name": "tripLength",
                        "label": "Trip Length",
                        "required": false,
                        "multiple": false,
                        "maxLength": 255,
                        "validationType": "none"
                    },
                    {
                        "type": "enumeration",
                        "name": "activity",
                        "label": "Activity",
                        "required": false,
                        "multiple": true,
                        "hint": "select",
                        "values": [
                            {
                                "key": "Camping",
                                "value": "Camping"
                            },
                            {
                                "key": "Surfing",
                                "value": "Surfing"
                            },
                            {
                                "key": "Skiing",
                                "value": "Skiing"
                            },
                            {
                                "key": "Cycling",
                                "value": "Cycling"
                            },
                            {
                                "key": "Hiking",
                                "value": "Hiking"
                            },
                            {
                                "key": "Skateboarding",
                                "value": "Skateboarding"
                            },
                            {
                                "key": "Rock Climbing",
                                "value": "Rock Climbing"
                            },
                            {
                                "key": "Running",
                                "value": "Running"
                            },
                            {
                                "key": "Snowboarding",
                                "value": "Snowboarding"
                            },
                            {
                                "key": "Social",
                                "value": "Social"
                            }
                        ]
                    },
                    {
                        "type": "number",
                        "name": "groupSize",
                        "label": "Group Size",
                        "description": "Group size",
                        "required": false,
                        "multiple": false,
                        "min": 1
                    },
                    {
                        "type": "enumeration",
                        "name": "difficulty",
                        "label": "Difficulty",
                        "required": false,
                        "multiple": true,
                        "hint": "select",
                        "values": [
                            {
                                "key": "Beginner",
                                "value": "Beginner"
                            },
                            {
                                "key": "Intermediate",
                                "value": "Intermediate"
                            },
                            {
                                "key": "Advanced",
                                "value": "Advanced"
                            },
                            {
                                "key": "Expert",
                                "value": "Expert"
                            }
                        ]
                    },
                    {
                        "type": "float-number",
                        "name": "price",
                        "label": "Price",
                        "description": "Price of the Adventure",
                        "required": false,
                        "multiple": false,
                        "defaultValue": 100
                    },
                    {
                        "type": "content-reference",
                        "name": "primaryImage",
                        "label": "Primary Image",
                        "required": false,
                        "multiple": false,
                        "showThumbnail": false,
                        "root": "/content/dam/wknd",
                        "allowedContentTypes": [
                            "image"
                        ]
                    },
                    {
                        "type": "long-text",
                        "name": "itinerary",
                        "label": "Itinerary",
                        "required": false,
                        "multiple": false,
                        "mimeType": "text/html"
                    },
                    {
                        "type": "long-text",
                        "name": "gearList",
                        "label": "What to Bring",
                        "required": false,
                        "multiple": false,
                        "mimeType": "text/html"
                    }
                ],
                "tags": [
                    {
                        "id": "wknd-shared:season/summer",
                        "title": "Summer",
                        "i18n": [],
                        "titlePath": "WKND Shared : Season / Summer",
                        "name": "summer",
                        "path": "/content/cq:tags/wknd-shared/season/summer",
                        "description": ""
                    },
                    {
                        "id": "wknd-shared:season/spring",
                        "title": "Spring",
                        "i18n": [],
                        "titlePath": "WKND Shared : Season / Spring",
                        "name": "spring",
                        "path": "/content/cq:tags/wknd-shared/season/spring",
                        "description": ""
                    }
                ]
            }
        ],
        "cursor": "string"
    }
    const modelId= 'audi_test_model';
    const fieldId= 'rte';
  return (
    <ul className="SideNav">
      <li className="SideNav-item">
        <NavLink className="SideNav-itemLink" activeClassName="is-selected" aria-current="page" exact to={getPath(modelId, fieldId)}>{modelId + '' + fieldId}</NavLink>
      </li>
    </ul>
  )
}

export default SideBar
