/**
 * @module NetworkTest
 */

/**
* Define Network Connectivy class
*/

import { connectivityTest, ConnectivityTestResults } from './connectivityTest';
import testQuality from './testQuality';
import {
  IncompleteSessionCredentialsError,
  InvalidOnUpdateCallback,
  InvalidOnCompleteCallback,
  MissingOpenTokInstanceError,
  MissingSessionCredentialsError,
} from './errors';
import { getOr } from '../util';

export default class NetworkTest {

  credentials: SessionCredentials;
  environment: OpenTokEnvironment;
  OT: OpenTok;

  /**
   * Returns an instance of NetworkConnectivity
   */
  constructor(OT: OpenTok, credentials: SessionCredentials, environment: OpenTokEnvironment = 'standard') {
    this.validateOT(OT);
    this.validateCredentials(credentials);
    this.OT = OT;
    this.credentials = credentials;
    this.environment = environment;
  }

  private validateOT(OT: OpenTok) {
    if (!OT || typeof OT !== 'object' || !OT.initSession) {
      throw new MissingOpenTokInstanceError();
    }
  }

  private validateCredentials(credentials: SessionCredentials) {
    if (!credentials) {
      throw new MissingSessionCredentialsError();
    }
    if (!credentials.apiKey || !credentials.sessionId || !credentials.token) {
      throw new IncompleteSessionCredentialsError();
    }
  }
  private validateCallbacks(
    updateCallback: UpdateCallback<any> | null,
    onComplete?: CompletionCallback<any>) {
    if (updateCallback) {
      if (typeof updateCallback !== 'function' || updateCallback.length !== 1) {
        throw new InvalidOnUpdateCallback();
      }
    }
    if (onComplete) {
      if (typeof onComplete !== 'function' || onComplete.length !== 2) {
        throw new InvalidOnCompleteCallback();
      }
    }
  }

  /**
   * This function runs a test publisher and based on the measured video bitrate,
   * audio bitrate, and the audio packet loss for the published stream, it returns
   * results indicating the recommended supported publisher settings.
   */
  testQuality(
    updateCallback: UpdateCallback<any>,
    completionCallback: CompletionCallback<any>): Promise<any> {
    this.validateCallbacks(updateCallback, completionCallback);
    return testQuality(
      this.OT, this.credentials, this.environment, updateCallback, completionCallback);
  }

  /**
   * This method checks to see if the client can connect to TokBox servers required for using OpenTok
   */
  checkConnectivity(
    deviceOptions?: DeviceOptions,
    onComplete?: CompletionCallback<any>): Promise<ConnectivityTestResults> {
    this.validateCallbacks(null, onComplete);
    return connectivityTest(this.OT, this.credentials, this.environment, deviceOptions, onComplete);
  }
}