// Alla scener. Varje scen: (A, opts) => { tid: bool (går tiden?), enter, exit, rita(ctx, dt), tangent(e) }
import { start } from './start.js';
import { kontor } from './kontor.js';
import { design } from './design.js';
import { personal } from './personal.js';
import { bygg } from './bygg.js';
import { lansering } from './lansering.js';
import { show } from './show.js';
import { telefoner } from './telefoner.js';
import { forskning } from './forskning.js';
import { nyheter } from './nyheter.js';
import { bolaget } from './bolaget.js';
import { meny } from './meny.js';
import { gavor } from './gavor.js';

export const SCENER = { start, kontor, design, personal, bygg, lansering, show, telefoner, forskning, nyheter, bolaget, meny, gavor };
