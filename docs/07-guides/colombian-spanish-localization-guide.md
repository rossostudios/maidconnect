# Colombian Spanish Localization Guide

## Document Overview
This guide documents the Colombian Spanish localization updates for MaidConnect (Casaora). Colombian Spanish has distinct characteristics that differ from generic/neutral Spanish, particularly in formality, vocabulary, and common expressions.

**Created**: 2025-11-07
**Status**: Active Implementation Guide
**Affects**: `/messages/es.json` translation file

---

## Why Colombian Spanish Localization Matters

Users in Colombia were misunderstanding certain words and phrases in our generic Spanish translation. This localization addresses three key areas:

1. **Formality Level**: Colombians strongly prefer "usted" over "tú," even in casual contexts
2. **Regional Vocabulary**: Specific terms for cleaning, household services, and professional interactions
3. **Natural Expressions**: Phrases that sound more natural to Colombian ears

---

## Key Characteristics of Colombian Spanish

### 1. Formality and Pronouns

**Critical Difference**: Colombians use "usted" (formal "you") in nearly all contexts, including:
- Family conversations
- Friends and peers
- Professional settings
- Service interactions

**Our Current Problem**: The es.json file uses informal "tú" throughout (78+ instances found).

**Solution**: Convert ALL instances of informal pronouns to formal "usted" forms.

### 2. Colombian-Specific Vocabulary

| Generic Spanish | Colombian Spanish | Context |
|----------------|------------------|---------|
| "asistenta" | "empleada doméstica" | Cleaner/domestic worker |
| "limpieza profunda" | "aseo profundo" | Deep cleaning |
| "fregar el suelo" | "trapear el piso" | Mop the floor |
| "tarifa" | "tarifa" (same, but context matters) | Rate/fee |
| "genial" | "chévere" or "bacano/a" | Great/awesome |
| "ahora" (urgency) | "ahoritica" | Right now |

### 3. Common Expressions

| Generic Spanish | Colombian Spanish |
|----------------|------------------|
| "¿Qué tal?" | "¿Qué hubo?" or "¿Qui'ubo?" |
| "muy bien" | "muy chévere" |
| "estupendo" | "¡bacano!" |

---

## Systematic Changes Required

### Phase 1: Formality Conversion (tú → usted)

#### Pronoun Changes

| Informal (tú) | Formal (usted) | Example Context |
|--------------|----------------|-----------------|
| tú | usted | Subject pronoun |
| tu/tus | su/sus | Possessive adjective |
| te | le/se | Object pronoun |
| ti | usted | Prepositional object |
| contigo | con usted | With you |

#### Verb Conjugation Changes

| Infinitive | tú form | usted form | Example |
|-----------|---------|------------|---------|
| ser | eres | es | "Eres verificado" → "Es verificado" |
| estar | estás | está | "¿Estás seguro?" → "¿Está seguro?" |
| tener | tienes | tiene | "Tienes una reserva" → "Tiene una reserva" |
| poder | puedes | puede | "Puedes reservar" → "Puede reservar" |
| querer | quieres | quiere | "¿Quieres cancelar?" → "¿Quiere cancelar?" |
| hacer | haces | hace | "Haces un buen trabajo" → "Hace un buen trabajo" |
| ver | ves | ve | "Ves tus reservas" → "Ve sus reservas" |
| necesitar | necesitas | necesita | "Necesitas ayuda" → "Necesita ayuda" |
| actualizar | actualizas | actualiza | "Actualizas tu perfil" → "Actualiza su perfil" |
| continuar | continúas | continúa | "Continúas refinando" → "Continúa refinando" |

#### Imperative (Command) Form Changes

| Infinitive | tú form | usted form | Example |
|-----------|---------|------------|---------|
| completar | completa | complete | "Completa tu perfil" → "Complete su perfil" |
| actualizar | actualiza | actualice | "Actualiza tu información" → "Actualice su información" |
| agregar | agrega | agregue | "Agrega tu teléfono" → "Agregue su teléfono" |
| cargar | carga | cargue | "Carga documentos" → "Cargue documentos" |
| crear | crea | cree | "Crea tu perfil" → "Cree su perfil" |
| mantener | mantén | mantenga | "Mantén tu portafolio actualizado" → "Mantenga su portafolio actualizado" |
| establecer | establece | establezca | "Establece tus horarios" → "Establezca sus horarios" |
| bloquear | bloquea | bloquee | "Bloquea fechas" → "Bloquee fechas" |
| compartir | comparte | comparta | "Comparte tu trayectoria" → "Comparta su trayectoria" |
| describir | describe | describa | "Describe qué incluye" → "Describa qué incluye" |
| elegir | elige | elija | "Elige un profesional" → "Elija un profesional" |
| explorar | explora | explore | "Explora profesionales" → "Explore profesionales" |
| seleccionar | selecciona | seleccione | "Selecciona todos los servicios" → "Seleccione todos los servicios" |
| subir | sube | suba | "Sube un pasaporte" → "Suba un pasaporte" |
| almacenar | almacena | almacene | "Almacena una tarjeta" → "Almacene una tarjeta" |
| hacer clic | haz clic | haga clic | "Haz clic en el ícono" → "Haga clic en el ícono" |
| gestionar | gestiona | gestione | "Gestiona tus ubicaciones" → "Gestione sus ubicaciones" |
| descargar | descarga | descargue | "Descarga recibos" → "Descargue recibos" |
| responder | responde | responda | "Responde algunas preguntas" → "Responda algunas preguntas" |
| ayudar | ayuda | ayude | "Ayúdanos a mejorar" → "Ayúdenos a mejorar" |
| compartir | comparte | comparta | "Comparte tus ideas" → "Comparta sus ideas" |
| enviar | envía | envíe | "Envía un correo" → "Envíe un correo" |
| unirse | únete | únase | "Únete a nuestra red" → "Únase a nuestra red" |
| comunicarse | comunícate | comuníquese | "Comunícate con soporte" → "Comuníquese con soporte" |
| volver | vuelve | vuelva | "Vuelve pronto" → "Vuelva pronto" |
| chatear | chatea | chatee | "Chatea con profesionales" → "Chatee con profesionales" |
| ver | ve | vea | "Ve tus reservas" → "Vea sus reservas" |
| elegir | elige | elija | "Elige la experiencia" → "Elija la experiencia" |
| repetir | repite | repita | "Repite la contraseña" → "Repita la contraseña" |
| revisar | revisa | revise | "Revisa tu correo" → "Revise su correo" |
| intentar | intenta | intente | "Intenta ajustar" → "Intente ajustar" |
| mirar | mira | mire | "Mira en qué estamos trabajando" → "Mire en qué estamos trabajando" |
| votar | vota | vote | "Vota por las funciones" → "Vote por las funciones" |

### Phase 2: Specific Translation Updates

#### Lines with Identified Issues (from grep search)

These specific instances need updating (line numbers may shift during editing):

| Line | Current (Informal) | Corrected (Formal) |
|------|-------------------|-------------------|
| 42 | "Cada profesional se somete..." | No change needed (3rd person) |
| 62 | "Revisa tu progreso...completa los siguientes pasos" | "Revise su progreso...complete los siguientes pasos" |
| 72 | "Completa cada paso para que los clientes puedan descubrirte y reservarte" | "Complete cada paso para que los clientes puedan descubrirle y reservarle" |
| 77 | "Cuéntanos quién eres, tu experiencia" | "Cuéntenos quién es, su experiencia" |
| 82 | "Carga tu identificación oficial" | "Cargue su identificación oficial" |
| 87 | "Completa tu biografía, servicios, precios y disponibilidad" | "Complete su biografía, servicios, precios y disponibilidad" |
| 99 | "Agrega dos referencias profesionales" | "Agregue dos referencias profesionales" |
| 115 | "Aún no has agregado servicios" | "Aún no ha agregado servicios" |
| 134 | "Gestiona tus horarios...cuando no estés disponible" | "Gestione sus horarios...cuando no esté disponible" |
| 143 | "Bloquea fechas...Actualiza esto" | "Bloquee fechas...Actualice esto" |
| 184 | "Edita tu perfil" | "Edite su perfil" |
| 185 | "Lanza tu perfil de Casaora" | "Lance su perfil de Casaora" |
| 188 | "Actualiza tu información pública" | "Actualice su información pública" |
| 195 | "Cuéntanos sobre tu experiencia" | "Cuéntenos sobre su experiencia" |
| 202 | "Construye tu perfil" | "Construya su perfil" |
| 213 | "Actualiza tu información pública" | "Actualice su información pública" |
| 218 | "Ajusta tu biografía" | "Ajuste su biografía" |
| 226 | "Carga de forma segura escaneos o fotos de tu identificación" | "Cargue de forma segura escaneos o fotos de su identificación" |
| 238 | "te mantiene informado" | "le mantiene informado" |
| 241 | "Crea tu perfil público" | "Cree su perfil público" |
| 343 | "Comparte tu trayectoria...por qué a los clientes les encanta trabajar contigo" | "Comparta su trayectoria...por qué a los clientes les encanta trabajar con usted" |
| 362 | "Establece tus horarios de trabajo típicos" | "Establezca sus horarios de trabajo típicos" |
| 377 | "tu perfil se activa...Puedes continuar" | "su perfil se activa...Puede continuar" |
| 378 | "Tus cambios se actualizan" | "Sus cambios se actualizan" |
| 465 | "Crea tu primer complemento" | "Cree su primer complemento" |
| 478 | "Describe qué incluye" | "Describa qué incluye" |
| 509 | "¿Estás seguro de que quieres eliminar?" | "¿Está seguro de que quiere eliminar?" |
| 540 | "Describe tus especialidades y qué hace único tu trabajo" | "Describa sus especialidades y qué hace único su trabajo" |
| 561 | "Usa imágenes de alta calidad que muestren tu mejor trabajo" | "Use imágenes de alta calidad que muestren su mejor trabajo" |
| 564 | "Mantén tu portafolio actualizado" | "Mantenga su portafolio actualizado" |
| 578 | "Establece tu Horario Semanal" | "Establezca su Horario Semanal" |
| 579 | "Define qué días y horas estás disponible" | "Defina qué días y horas está disponible" |
| 583 | "Marca fechas cuando no estés disponible" | "Marque fechas cuando no esté disponible" |
| 585 | "Los cambios se reflejarán inmediatamente en tu perfil público" | "Los cambios se reflejarán inmediatamente en su perfil público" |
| 619 | "Cuéntale a los clientes sobre tu experiencia, especialidades y qué te hace genial" | "Cuéntele a los clientes sobre su experiencia, especialidades y qué le hace genial" |
| 675 | "Agrega tu teléfono" | "Agregue su teléfono" |
| 677 | "Agrega tu ciudad" | "Agregue su ciudad" |
| 690 | "Prepárate para reservar" | "Prepárese para reservar" |
| 694 | "Completa tu perfil" | "Complete su perfil" |
| 695 | "Agrega tus datos de contacto" | "Agregue sus datos de contacto" |
| 699 | "Verifica tu identidad" | "Verifique su identidad" |
| 700 | "Sube un pasaporte o identificación oficial" | "Suba un pasaporte o identificación oficial" |
| 710 | "Reserva tu primera visita" | "Reserve su primera visita" |
| 711 | "Elige un profesional de confianza y programa tu primer servicio" | "Elija un profesional de confianza y programe su primer servicio" |
| 726 | "Descarga recibos, agrega propinas o vuelve a reservar tus favoritos" | "Descargue recibos, agregue propinas o vuelva a reservar sus favoritos" |
| 737 | "Gestiona tus ubicaciones de servicio...Agrega detalles" | "Gestione sus ubicaciones de servicio...Agregue detalles" |
| 741 | "Compartir algunos detalles sobre tu hogar" | "Compartir algunos detalles sobre su hogar" |
| 746 | "puede ayudarte con verificación" | "puede ayudarle con verificación" |
| 757 | "Ve y gestiona tus citas de servicio" | "Vea y gestione sus citas de servicio" |
| 761 | "Acceso rápido a tus profesionales favoritos" | "Acceso rápido a sus profesionales favoritos" |
| 765 | "Chatea con profesionales sobre tus reservas" | "Chatee con profesionales sobre sus reservas" |
| 775 | "para reservar tu primer servicio" | "para reservar su primer servicio" |
| 834 | "Agrega tu primera dirección" | "Agregue su primera dirección" |
| 889 | "¿Estás seguro de que quieres eliminar esta dirección?" | "¿Está seguro de que quiere eliminar esta dirección?" |
| 930 | "Tu reserva se restablecerá" | "Su reserva se restablecerá" |
| 945 | "Ve y gestiona tus citas" | "Vea y gestione sus citas" |
| 949 | "Acceso rápido a tus profesionales favoritos" | "Acceso rápido a sus profesionales favoritos" |
| 953 | "Gestiona tus ubicaciones...Agrega detalles" | "Gestione sus ubicaciones...Agregue detalles" |
| 957 | "Ve tu historial de pagos, gestiona métodos de pago" | "Vea su historial de pagos, gestione métodos de pago" |
| 982 | "Chatea con profesionales sobre tus reservas" | "Chatee con profesionales sobre sus reservas" |
| 986 | "Gestiona tu información de perfil" | "Gestione su información de perfil" |
| 994 | "Para actualizar tu información de perfil, por favor contacta a soporte" | "Para actualizar su información de perfil, por favor comuníquese con soporte" |
| 1148 | No change needed (3rd person) | |
| 1989 | "Elige la experiencia que mejor se adapte a cómo planeas usar" | "Elija la experiencia que mejor se adapte a cómo planea usar" |
| 2014 | "Repite la contraseña" | "Repita la contraseña" |
| 2018 | "Por favor revisa tu correo electrónico" | "Por favor revise su correo electrónico" |
| 2021 | "¿Ya tienes una cuenta?" | "¿Ya tiene una cuenta?" |
| 2025 | "Te guiaremos con incorporación" | "Le guiaremos con incorporación" |
| 2124 | "Vuelve pronto" | "Vuelva pronto" |
| 2131 | "Encuentra tu Coincidencia Perfecta" | "Encuentre su Coincidencia Perfecta" |
| 2132 | "Responde algunas preguntas para encontrar" | "Responda algunas preguntas para encontrar" |
| 2139 | "Selecciona tu ciudad" | "Seleccione su ciudad" |
| 2141 | "Selecciona tu ciudad" | "Seleccione su ciudad" |
| 2159 | "Cuéntanos sobre tu hogar" | "Cuéntenos sobre su hogar" |
| 2173 | "Ayúdanos a encontrar profesionales que se ajusten a tu horario" | "Ayúdenos a encontrar profesionales que se ajusten a su horario" |
| 2208 | "Basado en tus preferencias" | "Basado en sus preferencias" |
| 2213 | "Intenta ajustar tus preferencias o explora todos los profesionales" | "Intente ajustar sus preferencias o explore todos los profesionales" |
| 2232 | "Ayúdanos a mejorar Casaora compartiendo tus ideas" | "Ayúdenos a mejorar Casaora compartiendo sus ideas" |
| 2241 | "Solo lo usaremos para hacer seguimiento a tu comentario" | "Solo lo usaremos para hacer seguimiento a su comentario" |
| 2244 | "Recopilamos tus comentarios...Respetamos tu privacidad" | "Recopilamos sus comentarios...Respetamos su privacidad" |
| 2250 | "Apreciamos que te hayas tomado el tiempo" | "Apreciamos que se haya tomado el tiempo" |
| 2256 | "Elige el plan perfecto para tus necesidades" | "Elija el plan perfecto para sus necesidades" |
| 2266 | "Únete a miles de clientes satisfechos" | "Únase a miles de clientes satisfechos" |
| 2274 | "Mira en qué estamos trabajando y vota por las funciones que te gustaría ver. Tu opinión da forma" | "Mire en qué estamos trabajando y vote por las funciones que le gustaría ver. Su opinión da forma" |
| 2280 | "Vuelve pronto para ver...Sé el primero en sugerir funciones y votar por lo que más te importa" | "Vuelva pronto para ver...Sea el primero en sugerir funciones y votar por lo que más le importa" |

### Phase 3: Colombian Vocabulary Adjustments

#### Cleaning and Household Terminology

| Current | Colombian Alternative | Notes |
|---------|---------------------|-------|
| "Limpieza del hogar" | "Aseo del hogar" or "Limpieza de casa" | Both are understood; "aseo" is slightly more common |
| "asistenta" | "empleada doméstica" | More respectful and commonly used in Colombia |
| "criada" | "empleada doméstica" | If used anywhere, replace with more respectful term |
| "fregar" | "lavar" (for dishes) or "trapear" (for floors) | Regional preference |
| "lavado de ventanas" | "limpieza de ventanas" | More natural |

#### General Vocabulary

| Current | Colombian Alternative | Context |
|---------|---------------------|---------|
| "estupendo" | "¡chévere!" or "¡bacano!" | Exclamations |
| "genial" | "chévere" | Positive feedback |
| "vale" | "listo" or "está bien" | Agreement/confirmation |
| "móvil" | "celular" | Cell phone |
| "ordenador" | "computador" | Computer |

#### Professional and Service Terms

| Current | Colombian Alternative | Notes |
|---------|---------------------|-------|
| "tarifa por hora" | "tarifa por hora" | Keep same (universally understood) |
| "reserva" | "reserva" | Keep same |
| "cliente" | "cliente" | Keep same |
| "profesional" | "profesional" | Keep same |

### Phase 4: Colombian Expressions and Phrases

#### Greetings and Common Phrases

| Generic Spanish | Colombian Spanish |
|----------------|------------------|
| "¿Cómo estás?" | "¿Cómo está?" (formal) or "¿Qui'ubo?" (very informal) |
| "¿Qué tal?" | "¿Qué hubo?" or "¿Cómo le va?" |
| "muy bien" | "muy bien" or "súper bien" |
| "de acuerdo" | "listo" or "dale" |

#### Service-Related Phrases

| Generic Spanish | Colombian Spanish | Context |
|----------------|------------------|---------|
| "en seguida" | "ahorita" or "ya mismo" | Right away |
| "ahora mismo" | "ahoritica" | Right this moment |
| "un momento" | "un momentico" | Diminutive form common |
| "por favor" | "por favor" | Keep same |
| "gracias" | "gracias" | Keep same |

---

## Implementation Strategy

### Step 1: Automated Find/Replace (with caution)

Use these regex patterns carefully, checking each replacement:

```regex
# Possessive pronouns
tu\s+([a-zñáéíóú]+) → su $1
tus\s+([a-zñáéíóú]+) → sus $1

# Object pronouns (context-dependent)
\ste\s → le
contigo → con usted

# Common verb patterns
estás seguro → está seguro
puedes → puede
tienes → tiene
eres → es
quieres → quiere
necesitas → necesita
```

### Step 2: Manual Review Sections

These require careful context checking:
- Imperative commands (many verb forms)
- Reflexive verbs (te → se)
- Indirect object pronouns
- Compound tenses

### Step 3: Testing Priorities

After implementing changes, test these user flows:
1. **Onboarding flow** (professional signup)
2. **Booking flow** (customer booking a service)
3. **Dashboard text** (both customer and professional)
4. **Help/support text**
5. **Error messages**

---

## Quality Assurance Checklist

Before marking localization complete:

- [ ] All informal pronouns converted to formal (tú → usted)
- [ ] All verb conjugations match formal address
- [ ] Commands use usted form (imperative formal)
- [ ] Possessive adjectives updated (tu/tus → su/sus)
- [ ] Object pronouns updated (te → le/se)
- [ ] Key vocabulary adapted to Colombian preferences
- [ ] Expressions sound natural to Colombian ears
- [ ] Professional and respectful tone maintained throughout
- [ ] No casual/slang in professional contexts (except where appropriate)
- [ ] Tested with native Colombian speaker
- [ ] Tested in application UI

---

## Resources

### Reference Materials
- **Colombian Spanish Dialects**: Rolo (Bogotá), Paisa (Medellín), Costeño (Caribbean coast)
- **Formality Guide**: Rosetta Stone Colombian Spanish guide
- **Vocabulary**: Real Academia Española + Colombian regionalisms

### Testing
- **Native Speakers**: Have Colombian team members or users review
- **A/B Testing**: Consider testing key pages with both versions
- **Feedback Loop**: Monitor user feedback after deployment

---

## Maintenance

### When to Update
- Adding new features with user-facing text
- User feedback indicating confusion
- Expanding to other Colombian cities/regions
- Professional terminology changes

### Version Control
- Document all changes in git commits
- Reference this guide in PR descriptions
- Update this guide if patterns change

---

## Appendix: Full Verb Conjugation Reference

### Present Tense - Most Common Verbs

| Infinitive | tú | usted | Example (usted) |
|-----------|-----|-------|-----------------|
| hablar | hablas | habla | "Usted habla español" |
| comer | comes | come | "¿Usted come carne?" |
| vivir | vives | vive | "¿Dónde vive usted?" |
| ser | eres | es | "Usted es verificado" |
| estar | estás | está | "¿Cómo está usted?" |
| ir | vas | va | "¿Usted va al centro?" |
| tener | tienes | tiene | "Usted tiene una reserva" |
| hacer | haces | hace | "¿Qué hace usted?" |
| poder | puedes | puede | "Usted puede reservar" |
| decir | dices | dice | "¿Qué dice usted?" |
| ver | ves | ve | "Usted ve sus reservas" |
| dar | das | da | "Usted da el servicio" |
| saber | sabes | sabe | "¿Usted sabe cocinar?" |
| querer | quieres | quiere | "¿Qué quiere usted?" |
| llegar | llegas | llega | "¿Cuándo llega usted?" |
| poner | pones | pone | "Usted pone atención" |
| parecer | pareces | parece | "Usted parece profesional" |
| quedar | quedas | queda | "¿Dónde queda usted?" |
| creer | crees | cree | "¿Usted cree que...?" |
| hablar | hablas | habla | "Usted habla muy bien" |
| llevar | llevas | lleva | "Usted lleva experiencia" |
| dejar | dejas | deja | "Usted deja todo limpio" |
| seguir | sigues | sigue | "¿Usted sigue disponible?" |
| encontrar | encuentras | encuentra | "Usted encuentra profesionales" |
| llamar | llamas | llama | "¿Cómo se llama usted?" |
| venir | vienes | viene | "¿Cuándo viene usted?" |
| pensar | piensas | piensa | "¿Qué piensa usted?" |
| salir | sales | sale | "¿A qué hora sale usted?" |
| volver | vuelves | vuelve | "Usted vuelve mañana" |
| tomar | tomas | toma | "Usted toma decisiones" |
| conocer | conoces | conoce | "¿Usted conoce la ciudad?" |
| sentir | sientes | siente | "¿Cómo se siente usted?" |
| tratar | tratas | trata | "Usted trata bien" |
| mirar | miras | mira | "Usted mira el perfil" |
| contar | cuentas | cuenta | "Usted cuenta con nosotros" |
| empezar | empiezas | empieza | "¿Cuándo empieza usted?" |
| buscar | buscas | busca | "Usted busca profesionales" |
| existir | existes | existe | (rarely used in 2nd person) |
| entrar | entras | entra | "Usted entra al sistema" |
| trabajar | trabajas | trabaja | "¿Dónde trabaja usted?" |
| escribir | escribes | escribe | "Usted escribe bien" |
| producir | produces | produce | "Usted produce resultados" |
| leer | lees | lee | "Usted lee las reseñas" |
| aceptar | aceptas | acepta | "Usted acepta la reserva" |
| recordar | recuerdas | recuerda | "¿Usted recuerda...?" |
| terminar | terminas | termina | "¿Cuándo termina usted?" |
| andar | andas | anda | "¿Por dónde anda usted?" |
| cumplir | cumples | cumple | "Usted cumple sus promesas" |
| vivir | vives | vive | "¿Dónde vive usted?" |
| aprender | aprendes | aprende | "Usted aprende rápido" |
| comprender | comprendes | comprende | "¿Usted comprende?" |
| abrir | abres | abre | "Usted abre oportunidades" |

### Imperative (Commands) - Most Common

| Infinitive | tú | usted | Example (usted) |
|-----------|-----|-------|-----------------|
| hablar | habla | hable | "Hable con soporte" |
| comer | come | coma | "Coma tranquilo/a" |
| vivir | vive | viva | "Viva la experiencia" |
| ser | sé | sea | "Sea bienvenido" |
| estar | está | esté | "Esté tranquilo" |
| ir | ve | vaya | "Vaya a su dashboard" |
| tener | ten | tenga | "Tenga en cuenta" |
| hacer | haz | haga | "Haga clic aquí" |
| poder | — | pueda | (rarely used as command) |
| decir | di | diga | "Díganos su opinión" |
| ver | ve | vea | "Vea sus reservas" |
| dar | da | dé | "Dé su consentimiento" |
| saber | sabe | sepa | "Sepa que..." |
| querer | — | quiera | (rarely used as command) |
| llegar | llega | llegue | "Llegue a tiempo" |
| poner | pon | ponga | "Ponga atención" |
| volver | vuelve | vuelva | "Vuelva pronto" |
| seguir | sigue | siga | "Siga las instrucciones" |
| encontrar | encuentra | encuentre | "Encuentre su profesional" |
| llamar | llama | llame | "Llame a soporte" |
| venir | ven | venga | "Venga preparado" |
| pensar | piensa | piense | "Piense en sus necesidades" |
| salir | sal | salga | "Salga de la sesión" |
| tomar | toma | tome | "Tome una decisión" |
| conocer | conoce | conozca | "Conozca a los profesionales" |
| sentir | siente | sienta | "Siéntase en casa" |
| mirar | mira | mire | "Mire las opciones" |
| contar | cuenta | cuente | "Cuente con nosotros" |
| empezar | empieza | empiece | "Empiece ahora" |
| buscar | busca | busque | "Busque profesionales" |
| entrar | entra | entre | "Entre al sistema" |
| trabajar | trabaja | trabaje | "Trabaje con confianza" |
| escribir | escribe | escriba | "Escriba un mensaje" |
| leer | lee | lea | "Lea las condiciones" |
| aceptar | acepta | acepte | "Acepte los términos" |
| recordar | recuerda | recuerde | "Recuerde su contraseña" |
| terminar | termina | termine | "Termine el proceso" |
| cumplir | cumple | cumpla | "Cumpla los requisitos" |
| aprender | aprende | aprenda | "Aprenda más" |
| comprender | comprende | comprenda | "Comprenda las políticas" |
| abrir | abre | abra | "Abra su cuenta" |
| cerrar | cierra | cierre | "Cierre sesión" |
| completar | completa | complete | "Complete su perfil" |
| actualizar | actualiza | actualice | "Actualice su información" |
| agregar | agrega | agregue | "Agregue detalles" |
| cargar | carga | cargue | "Cargue documentos" |
| crear | crea | cree | "Cree su perfil" |
| mantener | mantén | mantenga | "Mantenga actualizado" |
| establecer | establece | establezca | "Establezca horarios" |
| bloquear | bloquea | bloquee | "Bloquee fechas" |
| compartir | comparte | comparta | "Comparta detalles" |
| describir | describe | describa | "Describa el servicio" |
| elegir | elige | elija | "Elija un profesional" |
| explorar | explora | explore | "Explore opciones" |
| seleccionar | selecciona | seleccione | "Seleccione servicios" |
| subir | sube | suba | "Suba documentos" |
| almacenar | almacena | almacene | "Almacene su tarjeta" |
| gestionar | gestiona | gestione | "Gestione reservas" |
| descargar | descarga | descargue | "Descargue recibos" |
| responder | responde | responda | "Responda preguntas" |
| ayudar | ayuda | ayude | "Ayúdenos a mejorar" |
| enviar | envía | envíe | "Envíe un mensaje" |
| unirse | únete | únase | "Únase ahora" |
| comunicarse | comunícate | comuníquese | "Comuníquese con soporte" |
| chatear | chatea | chatee | "Chatee con profesionales" |
| intentar | intenta | intente | "Intente nuevamente" |
| votar | vota | vote | "Vote por funciones" |

---

**End of Guide**
