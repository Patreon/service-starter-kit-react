const mapper = (collection, iteratee) => collection.map(iteratee);

export default (maybeCollection, iteratee, iterate = mapper) => (
    Array.isArray(maybeCollection) ?
    iterate(maybeCollection, iteratee) :
    iteratee(maybeCollection)
);
