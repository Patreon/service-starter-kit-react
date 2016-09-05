import { destroy as deleteStoredSession } from '../../models/session';

export default function deleteSession(req) {
    return deleteStoredSession(req);
}
