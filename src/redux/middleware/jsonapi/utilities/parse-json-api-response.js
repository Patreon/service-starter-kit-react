import mapOrCall from './map-or-call';
import { camelizeKeys } from 'humps';

/* strip out 'self' relationship and links for now. easy to add later if we need them.  -gb */
const parseRelationships = (relationships) => (
    relationships ?
        Object.keys(relationships).reduce((memo, relationshipKey) => {
            if (relationshipKey === 'self') return memo;
            memo[relationshipKey] = relationships[relationshipKey].data;
            return memo;
        }, {}) :
        null
);

const parseRelationshipMetaAndLinks = (relationships) => (
    relationships ?
        Object.keys(relationships).reduce((memo, relationshipKey) => {
            if (relationshipKey === 'self') return memo;
            memo[relationshipKey] = {
                links: relationships[relationshipKey].links,
                meta: relationships[relationshipKey].meta
            };
            return memo;
        }, {}) :
        null
);

const parseResourceCb = (_fetchedAt) => ({ relationships, attributes, id, type }) => ({
    ...camelizeKeys(attributes),
    id,
    type,
    _fetchedAt,
    relationships: camelizeKeys(parseRelationships(relationships))
});

const parseResourceMetaAndLinks = ({ relationships }) => {
    const relationshipMetaAndLinks = parseRelationshipMetaAndLinks(relationships);

    if (relationshipMetaAndLinks === null) return {};

    return Object.keys(relationshipMetaAndLinks).reduce((memo, key) => {
        memo.links[key] = relationshipMetaAndLinks[key].links;
        memo.meta[key] = relationshipMetaAndLinks[key].meta;
        return memo;
    }, { links: {}, meta: {} });
};

const parseJsonApiResponse = ({data, included, meta, links}) => {
    let returnData = data;
    let returnIncluded = included;
    const _fetchedAt = Date.now();
    const parseResource = parseResourceCb(_fetchedAt);

    let relationshipMetaAndLinks;
    if (returnData) relationshipMetaAndLinks = mapOrCall(returnData, parseResourceMetaAndLinks);
    if (returnData) returnData = mapOrCall(returnData, parseResource);
    if (returnIncluded) returnIncluded = mapOrCall(returnIncluded, parseResource);

    return {
        data: returnData,
        included: returnIncluded,
        meta: camelizeKeys({
            self: meta,
            ...relationshipMetaAndLinks.meta
        }),
        links: camelizeKeys({
            self: links,
            ...relationshipMetaAndLinks.links
        }),
        _fetchedAt
    };
};

export default parseJsonApiResponse;

export const safeParseJsonApiResponse = (json) => !!json ? parseJsonApiResponse(json) : {};
