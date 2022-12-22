import { deserialize, serialize } from 'bson';

import { Binary } from '../../bson';
import { MongoMissingCredentialsError } from '../../error';
import { Callback, ns } from '../../utils';
import { AuthContext, AuthProvider } from './auth_provider';

declare function resolveOIDCToken(options: any): string;

export class OIDC extends AuthProvider {
  override auth(authContext: AuthContext, callback: Callback): void {
    const { connection, credentials } = authContext;
    if (!credentials) {
      return callback(new MongoMissingCredentialsError('AuthContext must provide credentials.'));
    }
    const username = credentials.username;

    const payload = new Binary(serialize({ n: username }));
    const command = {
      saslStart: 1,
      mechanism: 'MONGODB-OIDC',
      payload: payload,
      autoAuthorize: 1
    };

    connection.command(ns('$external.$cmd'), command, undefined, (err, result) => {
      if (err) {
        return callback(err);
      }

      Promise.resolve()
        .then(() => resolveOIDCToken(deserialize(result.payload.buffer)))
        .then(token => {
          const payload = new Binary(serialize({ jwt: token }));
          const command = {
            saslContinue: 1,
            conversationId: result.conversationId,
            payload: payload
          };

          connection.command(ns('$external.$cmd'), command, undefined, callback);
        }, callback);
    });
  }
}
