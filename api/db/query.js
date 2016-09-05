import pg from 'pg';
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

export function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return input;
    }

    const regex = new RegExp(/[\0\x08\x09\x1a\n\r"'\\\%]/g);
    const escaper = function escaper(char) {
        const inChar = ['\0', '\x08', '\x09', '\x1a', '\n', '\r', "'", '"', '\\', '%'];
        const outChar = ['\\0', '\\b', '\\t', '\\z', '\\n', '\\r', "''", '\\"', '\\\\', '\\%'];
        const inIndex = inChar.indexOf(char);
        return outChar[inIndex];
    };

    const result = input.replace(regex, escaper);
    return result;
}

function dirtyOutput(output) {
    if (typeof output !== 'string') {
        return output;
    }

    const regex = new RegExp(/\\[0btznr"\\%]/g);
    const escaper = function escaper(char) {
        const inChar = ['\\0', '\\b', '\\t', '\\z', '\\n', '\\r', '\\"', '\\\\', '\\%'];
        const outChar = ['\0', '\x08', '\x09', '\x1a', '\n', '\r', '"', '\\', '%'];
        const inIndex = inChar.indexOf(char);
        return outChar[inIndex];
    };

    const result = output.replace(regex, escaper);
    return result;
}

function dirtyRows(rows) {
    return rows.map((row) => {
        if (typeof row === 'object') {
            const result = {};
            for (const key in row) {
                if (row.hasOwnProperty(key)) {
                    result[key] = dirtyOutput(row[key]);
                }
            }
            return result;
        }
        return dirtyOutput(row);
    });
}

export function executeQuery(queryString, callback) {
    pg.connect(connectionString, (connectionError, client, done) => {
        if (connectionError) {
            callback(undefined, connectionError);
        } else {
            client.query(queryString, (queryError, result) => {
                done();
                if (queryError) {
                    callback(undefined, queryError);
                } else {
                    callback(dirtyRows(result.rows), undefined);
                }
            });
        }
    });
}
