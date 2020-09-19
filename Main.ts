import {IPlugin, IModLoaderAPI} from 'modloader64_api/IModLoaderAPI';
import {IOOTCore} from 'modloader64_api/OOT/OOTAPI';
import {InjectCore} from 'modloader64_api/CoreInjection';

let triforce: number = 0;
let newTriforce: number;

const saveContext: number = 0x8011A5D0;

const sceneFlagsStart: number = saveContext + 0xD4;
const sceneFlagsSize: number = 28;

const curTriforceScene: number = 0x48; //72
const curTriforceOffset: number = 18;
const curTriforceAddr: number = sceneFlagsStart + (sceneFlagsSize * curTriforceScene) + curTriforceOffset;

class Main implements IPlugin{

    ModLoader!: IModLoaderAPI;
    pluginName?: string | undefined;
    @InjectCore()
    core!: IOOTCore;

    preinit(): void {
    }
    init(): void {
    }
    postinit(): void {
    }
    onTick(frame?: number | undefined): void {
        newTriforce = this.ModLoader.emulator.rdramRead16(curTriforceAddr);

        if (newTriforce > triforce)
        {
            triforce = newTriforce;
            this.ModLoader.logger.debug("New triforce count detected: " + triforce.toString());
        }

        if (newTriforce < triforce)
        {
            this.ModLoader.emulator.rdramWrite16(curTriforceAddr, triforce);
            this.ModLoader.logger.debug("Correcting triforce count. New value: " + triforce.toString());
        }

        
    }

}

module.exports = Main;
