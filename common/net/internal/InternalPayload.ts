/**
 * Matthieu P. © UniX Corp 2020.
 * This file describe the basic payload on the LavaPod internal infrastructure.
 */

export class InternalPayload {
    public o: import('./InternalOpCodes').InternalOpCodes
    public d?: any
    public t?: string
}
