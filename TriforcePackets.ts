import { Packet } from 'modloader64_api/ModLoaderDefaultImpls';

export class EndGamePacket extends Packet 
{
    constructor(lobby: string)
    {
        super('EndGamePacket', 'TriforceBank', lobby, true);
    }
}

export class SendHighCountPacket extends Packet
{
    count: number;

    constructor(lobby: string, count: number)
    {
        super('SendHighCountPacket', 'TriforceBank', lobby, true);
        this.count = count;
    }
}