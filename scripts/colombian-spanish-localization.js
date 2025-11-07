#!/usr/bin/env node

/**
 * Colombian Spanish Localization Script
 *
 * This script converts the generic Spanish (es.json) translations to Colombian Spanish
 * by applying systematic transformations for formality (tú → usted) and vocabulary.
 *
 * Usage: node scripts/colombian-spanish-localization.js
 *
 * See docs/07-guides/colombian-spanish-localization-guide.md for full documentation.
 */

const fs = require('fs');
const path = require('path');

// File paths
const ES_JSON_PATH = path.join(__dirname, '../messages/es.json');
const BACKUP_PATH = path.join(__dirname, '../messages/es.json.backup');

console.log('🇨🇴 Colombian Spanish Localization Script\n');

// Step 1: Create backup
console.log('📋 Creating backup...');
try {
  const originalContent = fs.readFileSync(ES_JSON_PATH, 'utf8');
  fs.writeFileSync(BACKUP_PATH, originalContent, 'utf8');
  console.log(`✓ Backup created at: ${BACKUP_PATH}\n`);
} catch (error) {
  console.error('❌ Error creating backup:', error.message);
  process.exit(1);
}

// Step 2: Read and parse JSON
console.log('📖 Reading es.json...');
let jsonContent;
try {
  const fileContent = fs.readFileSync(ES_JSON_PATH, 'utf8');
  jsonContent = JSON.parse(fileContent);
  console.log('✓ JSON parsed successfully\n');
} catch (error) {
  console.error('❌ Error reading/parsing JSON:', error.message);
  process.exit(1);
}

// Step 3: Define transformation rules
console.log('🔧 Applying Colombian Spanish transformations...\n');

const transformations = {
  // PHASE 1: Possessive pronouns (tu/tus → su/sus)
  possessives: [
    // "tu " followed by noun → "su "
    { from: /\btu\s+/gi, to: 'su ', desc: 'tu → su (possessive)' },
    // "tus " followed by noun → "sus "
    { from: /\btus\s+/gi, to: 'sus ', desc: 'tus → sus (possessive plural)' },
  ],

  // PHASE 2: Object pronouns
  objectPronouns: [
    // " te " (object pronoun) → " le " or " se " (context-dependent, we'll use "le" as default)
    // This is tricky - "te" can be direct/indirect object or reflexive
    // We'll handle common patterns:
    { from: /\bte\s+/gi, to: 'le ', desc: 'te → le (object pronoun)' },
    { from: /\scontigo\b/gi, to: ' con usted', desc: 'contigo → con usted' },
  ],

  // PHASE 3: Present tense verb conjugations (most common)
  presentTense: [
    // SER - eres → es
    { from: /\beres\b/gi, to: 'es', desc: 'eres → es (ser)' },

    // ESTAR - estás → está
    { from: /\bestás\b/gi, to: 'está', desc: 'estás → está (estar)' },

    // TENER - tienes → tiene
    { from: /\btienes\b/gi, to: 'tiene', desc: 'tienes → tiene (tener)' },

    // PODER - puedes → puede
    { from: /\bpuedes\b/gi, to: 'puede', desc: 'puedes → puede (poder)' },

    // QUERER - quieres → quiere
    { from: /\bquieres\b/gi, to: 'quiere', desc: 'quieres → quiere (querer)' },

    // HACER - haces → hace
    { from: /\bhaces\b/gi, to: 'hace', desc: 'haces → hace (hacer)' },

    // VER - ves → ve
    { from: /\bves\b/gi, to: 've', desc: 'ves → ve (ver)' },

    // NECESITAR - necesitas → necesita
    { from: /\bnecesitas\b/gi, to: 'necesita', desc: 'necesitas → necesita (necesitar)' },

    // PLANEAR - planeas → planea
    { from: /\bplaneas\b/gi, to: 'planea', desc: 'planeas → planea (planear)' },

    // USAR - usas → usa
    { from: /\busas\b/gi, to: 'usa', desc: 'usas → usa (usar)' },

    // CONTINUAR - continúas → continúa
    { from: /\bcontinúas\b/gi, to: 'continúa', desc: 'continúas → continúa (continuar)' },

    // Common -AR verbs: actualizas → actualiza
    { from: /\bactualizas\b/gi, to: 'actualiza', desc: 'actualizas → actualiza' },

    // VAS → VA
    { from: /\bvas\b/gi, to: 'va', desc: 'vas → va (ir)' },

    // HAS → HA (perfect tense)
    { from: /\bhas\s+(agregado|completado|hecho|visto|sido|estado|tenido)/gi, to: 'ha $1', desc: 'has → ha (present perfect)' },
  ],

  // PHASE 4: Imperative commands (most important for UI)
  imperatives: [
    // COMPLETAR - completa → complete
    { from: /\bCompleta\b/g, to: 'Complete', desc: 'Completa → Complete (completar)' },
    { from: /\bcompleta\b/g, to: 'complete', desc: 'completa → complete (completar)' },

    // ACTUALIZAR - actualiza → actualice
    { from: /\bActualiza\b/g, to: 'Actualice', desc: 'Actualiza → Actualice (actualizar)' },
    { from: /\bactualiza\b/g, to: 'actualice', desc: 'actualiza → actualice (actualizar)' },

    // AGREGAR - agrega → agregue
    { from: /\bAgrega\b/g, to: 'Agregue', desc: 'Agrega → Agregue (agregar)' },
    { from: /\bagrega\b/g, to: 'agregue', desc: 'agrega → agregue (agregar)' },

    // CARGAR - carga → cargue
    { from: /\bCarga\b/g, to: 'Cargue', desc: 'Carga → Cargue (cargar)' },
    { from: /\bcarga\b/g, to: 'cargue', desc: 'carga → cargue (cargar)' },

    // CREAR - crea → cree
    { from: /\bCrea\b/g, to: 'Cree', desc: 'Crea → Cree (crear)' },
    { from: /\bcrea\b/g, to: 'cree', desc: 'crea → cree (crear)' },

    // MANTENER - mantén → mantenga
    { from: /\bMantén\b/g, to: 'Mantenga', desc: 'Mantén → Mantenga (mantener)' },
    { from: /\bmantén\b/g, to: 'mantenga', desc: 'mantén → mantenga (mantener)' },

    // ESTABLECER - establece → establezca
    { from: /\bEstablece\b/g, to: 'Establezca', desc: 'Establece → Establezca (establecer)' },
    { from: /\bestablece\b/g, to: 'establezca', desc: 'establece → establezca (establecer)' },

    // BLOQUEAR - bloquea → bloquee
    { from: /\bBloquea\b/g, to: 'Bloquee', desc: 'Bloquea → Bloquee (bloquear)' },
    { from: /\bbloquea\b/g, to: 'bloquee', desc: 'bloquea → bloquee (bloquear)' },

    // COMPARTIR - comparte → comparta
    { from: /\bComparte\b/g, to: 'Comparta', desc: 'Comparte → Comparta (compartir)' },
    { from: /\bcomparte\b/g, to: 'comparta', desc: 'comparte → comparta (compartir)' },

    // DESCRIBIR - describe → describa
    { from: /\bDescribe\b/g, to: 'Describa', desc: 'Describe → Describa (describir)' },
    { from: /\bdescribe\b/g, to: 'describa', desc: 'describe → describa (describir)' },

    // ELEGIR - elige → elija
    { from: /\bElige\b/g, to: 'Elija', desc: 'Elige → Elija (elegir)' },
    { from: /\belige\b/g, to: 'elija', desc: 'elige → elija (elegir)' },

    // EXPLORAR - explora → explore
    { from: /\bExplora\b/g, to: 'Explore', desc: 'Explora → Explore (explorar)' },
    { from: /\bexplora\b/g, to: 'explore', desc: 'explora → explore (explorar)' },

    // SELECCIONAR - selecciona → seleccione
    { from: /\bSelecciona\b/g, to: 'Seleccione', desc: 'Selecciona → Seleccione (seleccionar)' },
    { from: /\bselecciona\b/g, to: 'seleccione', desc: 'selecciona → seleccione (seleccionar)' },

    // SUBIR - sube → suba
    { from: /\bSube\b/g, to: 'Suba', desc: 'Sube → Suba (subir)' },
    { from: /\bsube\b/g, to: 'suba', desc: 'sube → suba (subir)' },

    // ALMACENAR - almacena → almacene
    { from: /\bAlmacena\b/g, to: 'Almacene', desc: 'Almacena → Almacene (almacenar)' },
    { from: /\balmacena\b/g, to: 'almacene', desc: 'almacena → almacene (almacenar)' },

    // HACER CLIC - haz clic → haga clic
    { from: /\bhaz clic\b/gi, to: 'haga clic', desc: 'haz clic → haga clic' },
    { from: /\bHaz clic\b/g, to: 'Haga clic', desc: 'Haz clic → Haga clic' },

    // GESTIONAR - gestiona → gestione
    { from: /\bGestiona\b/g, to: 'Gestione', desc: 'Gestiona → Gestione (gestionar)' },
    { from: /\bgestiona\b/g, to: 'gestione', desc: 'gestiona → gestione (gestionar)' },

    // DESCARGAR - descarga → descargue
    { from: /\bDescarga\b/g, to: 'Descargue', desc: 'Descarga → Descargue (descargar)' },
    { from: /\bdescarga\b/g, to: 'descargue', desc: 'descarga → descargue (descargar)' },

    // RESPONDER - responde → responda
    { from: /\bResponde\b/g, to: 'Responda', desc: 'Responde → Responda (responder)' },
    { from: /\bresponde\b/g, to: 'responda', desc: 'responde → responda (responder)' },

    // AYUDAR - ayúdanos → ayúdenos
    { from: /\bAyúdanos\b/g, to: 'Ayúdenos', desc: 'Ayúdanos → Ayúdenos' },
    { from: /\bayúdanos\b/g, to: 'ayúdenos', desc: 'ayúdanos → ayúdenos' },

    // CONTAR - cuéntanos → cuéntenos
    { from: /\bCuéntanos\b/g, to: 'Cuéntenos', desc: 'Cuéntanos → Cuéntenos' },
    { from: /\bcuéntanos\b/g, to: 'cuéntenos', desc: 'cuéntanos → cuéntenos' },

    // ENVIAR - envía → envíe
    { from: /\bEnvía\b/g, to: 'Envíe', desc: 'Envía → Envíe (enviar)' },
    { from: /\benvía\b/g, to: 'envíe', desc: 'envía → envíe (enviar)' },

    // UNIRSE - únete → únase
    { from: /\bÚnete\b/g, to: 'Únase', desc: 'Únete → Únase (unirse)' },
    { from: /\búnete\b/g, to: 'únase', desc: 'únete → únase (unirse)' },

    // COMUNICARSE - comunícate → comuníquese
    { from: /\bComunícate\b/g, to: 'Comuníquese', desc: 'Comunícate → Comuníquese' },
    { from: /\bcomunícate\b/g, to: 'comuníquese', desc: 'comunícate → comuníquese' },

    // VOLVER - vuelve → vuelva
    { from: /\bVuelve\b/g, to: 'Vuelva', desc: 'Vuelve → Vuelva (volver)' },
    { from: /\bvuelve\b/g, to: 'vuelva', desc: 'vuelve → vuelva (volver)' },

    // CHATEAR - chatea → chatee
    { from: /\bChatea\b/g, to: 'Chatee', desc: 'Chatea → Chatee (chatear)' },
    { from: /\bchatea\b/g, to: 'chatee', desc: 'chatea → chatee (chatear)' },

    // VER - ve → vea (when imperative)
    { from: /\bVe (y|tus|tu|sus|su)\b/g, to: 'Vea $1', desc: 'Ve → Vea (ver - imperative)' },

    // EDITAR - edita → edite
    { from: /\bEdita\b/g, to: 'Edite', desc: 'Edita → Edite (editar)' },
    { from: /\bedita\b/g, to: 'edite', desc: 'edita → edite (editar)' },

    // LANZAR - lanza → lance
    { from: /\bLanza\b/g, to: 'Lance', desc: 'Lanza → Lance (lanzar)' },
    { from: /\blanza\b/g, to: 'lance', desc: 'lanza → lance (lanzar)' },

    // CONSTRUIR - construye → construya
    { from: /\bConstruye\b/g, to: 'Construya', desc: 'Construye → Construya (construir)' },
    { from: /\bconstruye\b/g, to: 'construya', desc: 'construye → construya (construir)' },

    // AJUSTAR - ajusta → ajuste
    { from: /\bAjusta\b/g, to: 'Ajuste', desc: 'Ajusta → Ajuste (ajustar)' },
    { from: /\bajusta\b/g, to: 'ajuste', desc: 'ajusta → ajuste (ajustar)' },

    // DEFINIR - define → defina
    { from: /\bDefine\b/g, to: 'Defina', desc: 'Define → Defina (definir)' },
    { from: /\bdefine\b/g, to: 'defina', desc: 'define → defina (definir)' },

    // MARCAR - marca → marque
    { from: /\bMarca\b/g, to: 'Marque', desc: 'Marca → Marque (marcar)' },
    { from: /\bmarca\b/g, to: 'marque', desc: 'marca → marque (marcar)' },

    // PREPARARSE - prepárate → prepárese
    { from: /\bPrepárate\b/g, to: 'Prepárese', desc: 'Prepárate → Prepárese' },
    { from: /\bprepárate\b/g, to: 'prepárese', desc: 'prepárate → prepárese' },

    // VERIFICAR - verifica → verifique
    { from: /\bVerifica\b/g, to: 'Verifique', desc: 'Verifica → Verifique (verificar)' },
    { from: /\bverifica\b/g, to: 'verifique', desc: 'verifica → verifique (verificar)' },

    // RESERVAR - reserva → reserve
    { from: /\bReserva\b/g, to: 'Reserve', desc: 'Reserva → Reserve (reservar)' },
    // Note: Don't replace "reserva" (noun) - only imperative context

    // PROGRAMAR - programa → programe
    { from: /\bPrograma\b/g, to: 'Programe', desc: 'Programa → Programe (programar)' },
    { from: /\bprograma\b/g, to: 'programe', desc: 'programa → programe (programar)' },

    // INTENTAR - intenta → intente
    { from: /\bIntenta\b/g, to: 'Intente', desc: 'Intenta → Intente (intentar)' },
    { from: /\bintenta\b/g, to: 'intente', desc: 'intenta → intente (intentar)' },

    // MIRAR - mira → mire
    { from: /\bMira\b/g, to: 'Mire', desc: 'Mira → Mire (mirar)' },
    { from: /\bmira\b/g, to: 'mire', desc: 'mira → mire (mirar)' },

    // VOTAR - vota → vote
    { from: /\bVota\b/g, to: 'Vote', desc: 'Vota → Vote (votar)' },
    { from: /\bvota\b/g, to: 'vote', desc: 'vota → vote (votar)' },

    // SER - sé → sea
    { from: /\bSé\b/g, to: 'Sea', desc: 'Sé → Sea (ser - imperative)' },

    // REVISAR - revisa → revise
    { from: /\bRevisa\b/g, to: 'Revise', desc: 'Revisa → Revise (revisar)' },
    { from: /\brevisa\b/g, to: 'revise', desc: 'revisa → revise (revisar)' },

    // REPETIR - repite → repita
    { from: /\bRepite\b/g, to: 'Repita', desc: 'Repite → Repita (repetir)' },
    { from: /\brepite\b/g, to: 'repita', desc: 'repite → repita (repetir)' },

    // ENCONTRAR - encuentra → encuentre
    { from: /\bEncuentra\b/g, to: 'Encuentre', desc: 'Encuentra → Encuentre (encontrar)' },
    { from: /\bencuentra\b/g, to: 'encuentre', desc: 'encuentra → encuentre (encontrar)' },
  ],

  // PHASE 5: Common phrases and expressions
  phrases: [
    // "¿Estás seguro?" → "¿Está seguro?"
    { from: /¿Estás seguro/gi, to: '¿Está seguro', desc: '¿Estás seguro? → ¿Está seguro?' },

    // "¿Ya tienes?" → "¿Ya tiene?"
    { from: /¿Ya tienes/gi, to: '¿Ya tiene', desc: '¿Ya tienes? → ¿Ya tiene?' },

    // "por favor contacta" → "por favor comuníquese"
    { from: /por favor contacta/gi, to: 'por favor comuníquese con', desc: 'contacta → comuníquese con' },
  ],

  // PHASE 6: Reflexive verbs and special cases
  reflexive: [
    // "te hayas tomado" → "se haya tomado"
    { from: /\bte hayas\b/gi, to: 'se haya', desc: 'te hayas → se haya (reflexive subjunctive)' },

    // "que te gustaría" → "que le gustaría"
    { from: /que te gustaría/gi, to: 'que le gustaría', desc: 'que te gustaría → que le gustaría' },

    // "te importa" → "le importa"
    { from: /te importa/gi, to: 'le importa', desc: 'te importa → le importa' },

    // "qué te hace" → "qué le hace"
    { from: /qué te hace/gi, to: 'qué le hace', desc: 'qué te hace → qué le hace' },

    // "trabajar contigo" → "trabajar con usted"
    { from: /trabajar contigo/gi, to: 'trabajar con usted', desc: 'trabajar contigo → trabajar con usted' },
  ],

  // PHASE 7: Colombian vocabulary adjustments (optional, but nice to have)
  vocabulary: [
    // "contacta" → "comuníquese con" (when standalone)
    { from: /\bContacta\b/g, to: 'Comuníquese con', desc: 'Contacta → Comuníquese con' },
    { from: /\bcontacta\b/g, to: 'comuníquese con', desc: 'contacta → comuníquese con' },
  ],
};

// Helper function to apply transformations recursively to JSON
function transformValue(value, transformations, stats) {
  if (typeof value === 'string') {
    let transformed = value;

    // Apply each category of transformations in order
    for (const category of ['possessives', 'objectPronouns', 'presentTense', 'imperatives', 'phrases', 'reflexive', 'vocabulary']) {
      const rules = transformations[category];
      if (!rules) continue;

      for (const rule of rules) {
        const before = transformed;
        transformed = transformed.replace(rule.from, rule.to);

        if (before !== transformed) {
          stats[category] = (stats[category] || 0) + 1;
          stats.total = (stats.total || 0) + 1;
        }
      }
    }

    return transformed;
  } else if (Array.isArray(value)) {
    return value.map(item => transformValue(item, transformations, stats));
  } else if (typeof value === 'object' && value !== null) {
    const transformed = {};
    for (const [key, val] of Object.entries(value)) {
      transformed[key] = transformValue(val, transformations, stats);
    }
    return transformed;
  }

  return value;
}

// Apply transformations
const stats = {};
const transformedJson = transformValue(jsonContent, transformations, stats);

console.log('📊 Transformation Statistics:');
console.log(`   • Possessives (tu/tus → su/sus): ${stats.possessives || 0}`);
console.log(`   • Object pronouns (te → le): ${stats.objectPronouns || 0}`);
console.log(`   • Present tense verbs: ${stats.presentTense || 0}`);
console.log(`   • Imperative commands: ${stats.imperatives || 0}`);
console.log(`   • Phrases: ${stats.phrases || 0}`);
console.log(`   • Reflexive verbs: ${stats.reflexive || 0}`);
console.log(`   • Vocabulary: ${stats.vocabulary || 0}`);
console.log(`   • TOTAL CHANGES: ${stats.total || 0}\n`);

// Step 4: Write transformed JSON back to file
console.log('💾 Writing transformed JSON...');
try {
  const jsonString = JSON.stringify(transformedJson, null, 2);
  fs.writeFileSync(ES_JSON_PATH, jsonString + '\n', 'utf8');
  console.log(`✓ Successfully wrote to: ${ES_JSON_PATH}\n`);
} catch (error) {
  console.error('❌ Error writing JSON:', error.message);
  process.exit(1);
}

// Step 5: Summary and next steps
console.log('✅ Colombian Spanish localization complete!\n');
console.log('📝 Next steps:');
console.log('   1. Review the changes: git diff messages/es.json');
console.log('   2. Test in the application');
console.log('   3. If issues arise, restore from backup: mv messages/es.json.backup messages/es.json');
console.log('   4. Refer to docs/07-guides/colombian-spanish-localization-guide.md for details\n');

console.log('🇨🇴 ¡Listo! Your Spanish translations are now Colombian-friendly.\n');
