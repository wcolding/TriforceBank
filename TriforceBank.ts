import {IPlugin, IModLoaderAPI} from 'modloader64_api/IModLoaderAPI';
import {IOOTCore} from 'modloader64_api/OOT/OOTAPI';
import {InjectCore} from 'modloader64_api/CoreInjection';
import { NetworkHandler } from 'modloader64_api/NetworkHandler';
import { EndGamePacket, SendHighCountPacket } from './TriforcePackets';

const curTriforceAddr: number = 0x8011AE96;

class TriforceBank implements IPlugin{

    ModLoader!: IModLoaderAPI;
    pluginName?: string | undefined;
    @InjectCore()
    core!: IOOTCore;

    triforce: number = 0;
    newTriforce: number = 0;
    finished: boolean = false;

    preinit(): void {
    }
    init(): void {
    }
    postinit(): void {
    }

    setTriforce(value:number): void {
        this.ModLoader.emulator.rdramWrite16(curTriforceAddr, value);
    }

    onTick(frame?: number | undefined): void 
    {
        if (!this.core.helper.isTitleScreen() && this.core.helper.isSceneNumberValid())
        {
            this.newTriforce = this.ModLoader.emulator.rdramRead16(curTriforceAddr);

            if (this.newTriforce > this.triforce)
            {
                this.triforce = this.newTriforce;
                this.ModLoader.logger.debug("New triforce count detected: " + this.triforce.toString());
            }

            if (this.newTriforce < this.triforce)
            {
                this.setTriforce(this.triforce);
                this.ModLoader.logger.debug("Correcting triforce count. New value: " + this.triforce.toString());
                this.ModLoader.clientSide.sendPacket(new SendHighCountPacket(this.ModLoader.clientLobby, this.triforce));
            }

            // Check for cutscene of Ganondorf defeated
            if ((this.core.save.cutscene_number == 0xFFF8) && (this.core.save.entrance_index == 0x00A0) && !this.finished)
            {
                this.ModLoader.logger.debug("Finished! Sending packet.");
                this.ModLoader.clientSide.sendPacket(new EndGamePacket(this.ModLoader.clientLobby));
                this.finished = true;
            } 
        }
    }

    @NetworkHandler('EndGamePacket')
    onRxEndGamePacket(packet: EndGamePacket)
    {
        // send to Ganondorf defeated screen
        this.core.commandBuffer.runWarp(0x00A0, 0xFFF8);
        this.finished = true; 

    }

    @NetworkHandler('SendHighCountPacket')
    onRxHighCountPacket(packet: SendHighCountPacket)
    {
        if (this.triforce < packet.count)
        {
            this.setTriforce(packet.count);
        }
    }
}

module.exports = TriforceBank;
