import prepareJsonApiResponseMiddleware from '../middleware/jsonapi/prepare-json-api-response';
import dataReducer from './data-reducer';

export default () => {
    return {
        middleware: [
            prepareJsonApiResponseMiddleware
        ],
        reducer: dataReducer
    };
};
