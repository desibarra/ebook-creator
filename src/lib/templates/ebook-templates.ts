
export interface EbookTemplate {
    id: string;
    name: string;
    category: string;
    icon: string;
    description: string;
    fields: TemplateField[];
    notebookLMPrompt: (values: Record<string, string>) => string;
    generationConfig: {
        defaultChapterCount: number;
        defaultWordCount: 'short' | 'medium' | 'long';
        includeTables: boolean;
        includeCases: boolean;
    };
}

export interface TemplateField {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number';
    placeholder?: string;
    options?: string[];
    required: boolean;
    helperText?: string;
}

export const EBOOK_TEMPLATES: EbookTemplate[] = [

    // PLANTILLA 1: GUÍA MÉDICA/SALUD
    {
        id: 'medical-guide',
        name: 'Guía Médica / Salud',
        category: 'Salud',
        icon: '🏥',
        description: 'Para eBooks sobre condiciones médicas, tratamientos, salud preventiva',

        fields: [
            {
                id: 'condition_name',
                label: 'Condición o Tema de Salud',
                type: 'text',
                placeholder: 'Ej: Hipotiroidismo y Menopausia',
                required: true,
                helperText: 'El tema médico principal del eBook'
            },
            {
                id: 'target_audience',
                label: 'Público Objetivo',
                type: 'text',
                placeholder: 'Ej: Mujeres de 45-60 años',
                required: true
            },
            {
                id: 'audience_pain_points',
                label: 'Problemas/Preocupaciones del Público',
                type: 'textarea',
                placeholder: 'Ej: Confusión entre síntomas de menopausia e hipotiroidismo, diagnóstico tardío, tratamiento inadecuado',
                required: true,
                helperText: 'Qué buscan resolver o aprender'
            },
            {
                id: 'key_topics',
                label: 'Temas Clave a Cubrir',
                type: 'textarea',
                placeholder: 'Ej: Diagnóstico diferencial, valores de laboratorio, tratamiento con levotiroxina, interacciones medicamentosas',
                required: true
            },
            {
                id: 'chapter_count',
                label: 'Número de Capítulos',
                type: 'number',
                placeholder: '12',
                required: true
            }
        ],

        notebookLMPrompt: (values) => `
Actúa como consultor editorial médico especializado en crear contenido educativo para pacientes.

CONTEXTO:
Estoy creando un eBook sobre "${values.condition_name}" dirigido a ${values.target_audience}.

PROBLEMÁTICA DEL PÚBLICO:
${values.audience_pain_points}

## 1. ESTRUCTURA DEL EBOOK (${values.chapter_count} capítulos)

Organiza el contenido en ${values.chapter_count} capítulos siguiendo esta lógica:

**IMPORTANTE:** 
- NO incluyas un capítulo llamado "Índice", "Estructura" o "Resumen".
- EMPIEZA DIRECTAMENTE con el Capítulo 1 (Contenido real).
- Cada sección debe empezar con "### Capítulo X: [Título]"

**Capítulos 1-2: FUNDAMENTOS**
- Introducción empática al problema
- Definición de la(s) condición(es) principal(es)
- Epidemiología y estadísticas relevantes

**Capítulos 3-5: DIAGNÓSTICO**
- Síntomas y manifestaciones clínicas
- Diagnóstico diferencial (qué condiciones se confunden)
- Pruebas de laboratorio e interpretación de resultados
- Valores de referencia y rangos normales

**Capítulos 6-8: TRATAMIENTO**
- Opciones terapéuticas disponibles
- Protocolos de tratamiento basados en evidencia
- Medicamentos: mecanismo de acción, dosificación, farmacocinética
- Efectos secundarios y contraindicaciones
- Interacciones medicamentosas y con alimentos

**Capítulos 9-10: ESTILO DE VIDA**
- Nutrición estratégica (alimentos que ayudan/interfieren)
- Ejercicio y actividad física recomendada
- Manejo de aspectos psicológicos (ansiedad, depresión)
- Calidad de vida y bienestar

**Capítulos 11-${values.chapter_count}: SEGUIMIENTO Y RECURSOS**
- Cronograma de monitoreo médico
- Señales de alerta
- Suplementación con evidencia
- Recursos adicionales y comunidades de apoyo

Para cada capítulo proporciona:
- Título atractivo y descriptivo
- Conceptos médicos principales extraídos de las fuentes
- Datos estadísticos y evidencia científica con [Fuente: nombre del documento]
- Protocolos clínicos específicos mencionados en las fuentes
- Valores de laboratorio, dosis de medicamentos, rangos de referencia

## 2. TABLAS DE DATOS COMPARATIVOS

Extrae de las fuentes y estructura en formato tabla:

**Tabla 1: Síntomas Comparativos**
Si aplica, compara síntomas de condiciones que se confunden

**Tabla 2: Valores de Laboratorio**
Rangos de referencia, valores normales vs anormales, interpretación

**Tabla 3: Dosificación de Medicamentos**
Dosis inicial, mantenimiento, ajustes según edad/peso/condición

**Tabla 4: Interacciones**
Medicamentos, suplementos y alimentos que interactúan

**Tabla 5: Cronograma de Seguimiento**
Frecuencia de controles, cuándo repetir exámenes

## 3. CASOS DE ESTUDIO REALISTAS

Basándote EXCLUSIVAMENTE en información clínica de las fuentes, sugiere 3-4 perfiles de pacientes que reflejen:
- Edad, síntomas iniciales
- Valores de laboratorio específicos mencionados en las fuentes
- Diagnóstico diferencial realizado
- Protocolo de tratamiento aplicado según las fuentes
- Cronología de mejora sintomática
- Citas de las fuentes que respalden el caso

## 4. PROTOCOLOS PRÁCTICOS ACCIONABLES

Extrae protocolos paso a paso:
- Cuándo solicitar evaluación médica (checklist de síntomas)
- Cómo prepararse para consulta (qué llevar, preguntas clave)
- Cómo tomar medicamentos correctamente (horarios, con qué, qué evitar)
- Cronograma de seguimiento (cada cuánto ver al médico, repetir estudios)
- Señales de alerta para consulta urgente

## 5. INFORMACIÓN CIENTÍFICA DETALLADA

Para cada medicamento o tratamiento mencionado:
- Mecanismo de acción explicado
- Farmacocinética (absorción, distribución, metabolismo, eliminación)
- Dosis basadas en las fuentes
- Contraindicaciones absolutas y relativas
- Advertencias y precauciones
- Manejo de efectos adversos

## 6. DISCLAIMERS Y CONSIDERACIONES LEGALES

Identifica advertencias críticas de las fuentes:
- Contraindicaciones absolutas
- Poblaciones de riesgo
- Situaciones que requieren supervisión médica estricta
- Información sobre embarazo/lactancia si aplica

FORMATO DE SALIDA:
Organiza toda la información por capítulos, indicando siempre:
- [Fuente: nombre exacto del documento]
- Datos numéricos exactos (dosis, valores, porcentajes)
- Nivel de evidencia si está disponible
- Aplicación práctica para el paciente

ENFOQUE:
- Basado 100% en las fuentes cargadas (no inventes datos)
- Lenguaje técnico pero traducido a términos accesibles
- Énfasis en aplicación práctica y accionable
- Incluir todas las advertencias y precauciones importantes
- Citar siempre la fuente de cada dato médico
`,

        generationConfig: {
            defaultChapterCount: 12,
            defaultWordCount: 'medium',
            includeTables: true,
            includeCases: true
        }
    },

    // PLANTILLA 2: GUÍA DE NEGOCIOS/INVERSIÓN
    {
        id: 'business-investment',
        name: 'Guía de Negocios / Inversión',
        category: 'Negocios',
        icon: '📈',
        description: 'Para eBooks sobre inversiones, finanzas, estrategia empresarial',

        fields: [
            {
                id: 'business_topic',
                label: 'Tema de Negocio/Inversión',
                type: 'text',
                placeholder: 'Ej: Inversión en Acciones para Principiantes',
                required: true
            },
            {
                id: 'target_audience',
                label: 'Público Objetivo',
                type: 'text',
                placeholder: 'Ej: Profesionistas 30-45 años que quieren invertir sus ahorros',
                required: true
            },
            {
                id: 'experience_level',
                label: 'Nivel de Experiencia',
                type: 'select',
                options: ['Principiante (sin conocimientos previos)', 'Intermedio (conocimientos básicos)', 'Avanzado (experiencia previa)'],
                required: true
            },
            {
                id: 'audience_goals',
                label: 'Objetivos del Público',
                type: 'textarea',
                placeholder: 'Ej: Hacer crecer sus ahorros, generar ingresos pasivos, planificar jubilación',
                required: true
            },
            {
                id: 'key_topics',
                label: 'Temas Clave a Cubrir',
                type: 'textarea',
                placeholder: 'Ej: Fundamentos de la bolsa, análisis fundamental, gestión de riesgo',
                required: true
            },
            {
                id: 'chapter_count',
                label: 'Número de Capítulos',
                type: 'number',
                placeholder: '15',
                required: true
            }
        ],

        notebookLMPrompt: (values) => `
Actúa como consultor editorial de negocios especializado en crear contenido educativo sobre inversiones y finanzas.

CONTEXTO:
Estoy creando un eBook sobre "${values.business_topic}" dirigido a ${values.target_audience} con nivel: ${values.experience_level}.

OBJETIVOS DEL PÚBLICO:
${values.audience_goals}

OBJETIVO:
Analiza las fuentes (libros, reportes financieros, análisis de mercado) y proporciona estructura completa de ${values.chapter_count} capítulos.

**IMPORTANTE:** 
- NO incluyas un capítulo llamado "Índice", "Estructura" o "Resumen". 
- Empieza directamente con el Capítulo 1 del contenido real.

Estructura:
- Conceptos clave y terminología
- Métodos de análisis con ejemplos reales
- Estrategias paso a paso
- Casos de estudio con números reales
- Tablas comparativas
- Herramientas y recursos
- Gestión de riesgos
- Disclaimers legales

FORMATO: Por capítulos con [Fuente: documento], ejemplos calculables, advertencias de riesgo.
`,

        generationConfig: {
            defaultChapterCount: 15,
            defaultWordCount: 'long',
            includeTables: true,
            includeCases: true
        }
    },

    // PLANTILLA 3: PLANTILLA PERSONALIZADA
    {
        id: 'custom',
        name: 'Plantilla Personalizada',
        category: 'General',
        icon: '🎨',
        description: 'Crea tu propia estructura desde cero',

        fields: [
            {
                id: 'ebook_topic',
                label: 'Tema del eBook',
                type: 'text',
                placeholder: 'Ej: Marketing Digital para Restaurantes',
                required: true
            },
            {
                id: 'target_audience',
                label: 'Público Objetivo',
                type: 'text',
                placeholder: 'Ej: Dueños de restaurantes pequeños',
                required: true
            },
            {
                id: 'audience_problems',
                label: 'Problemas que Resuelve',
                type: 'textarea',
                placeholder: 'Ej: Poca visibilidad online, no saben usar redes sociales',
                required: true
            },
            {
                id: 'key_outcomes',
                label: 'Resultados Esperados',
                type: 'textarea',
                placeholder: 'Ej: Aumentar seguidores, generar reservas online',
                required: true
            },
            {
                id: 'chapter_count',
                label: 'Número de Capítulos',
                type: 'number',
                placeholder: '12',
                required: true
            }
        ],

        notebookLMPrompt: (values) => `
Actúa como consultor editorial experto.

CONTEXTO: eBook sobre "${values.ebook_topic}" para ${values.target_audience}.

PROBLEMAS: ${values.audience_problems}
RESULTADOS: ${values.key_outcomes}

Analiza las fuentes y crea ${values.chapter_count} capítulos reales.

**IMPORTANTE:** NO incluyas un capítulo de "Índice" o "Estructura". Empieza directamente con el Capítulo 1.

Incluye:
- Estructura lógica progresiva
- Conceptos extraídos de fuentes con [Fuente: X]
- Pasos accionables
- Casos de estudio reales
- Tablas comparativas
- Plan de acción

FORMATO: Por capítulos, práctico, basado en fuentes.
`,

        generationConfig: {
            defaultChapterCount: 12,
            defaultWordCount: 'medium',
            includeTables: true,
            includeCases: true
        }
    }
];

export function getTemplate(id: string): EbookTemplate | undefined {
    return EBOOK_TEMPLATES.find(t => t.id === id);
}

export function generateNotebookLMPrompt(
    templateId: string,
    values: Record<string, string>
): string {
    const template = getTemplate(templateId);
    if (!template) throw new Error('Template not found');
    return template.notebookLMPrompt(values);
}

/**
 * Genera un prompt para que NotebookLM ayude al usuario a ENCONTRAR fuentes
 * en internet antes de hacer el análisis completo
 */
export function generateResearchPrompt(
    templateId: string,
    values: Record<string, string>
): string {
    const template = getTemplate(templateId);
    if (!template) throw new Error('Template not found');

    // Extraer el tema principal según la plantilla
    const topic = values.ebook_topic ||
        values.condition_name ||
        values.business_topic ||
        values.technology_topic ||
        'el tema especificado';

    const audience = values.target_audience || 'público general';
    const keyTopics = values.key_topics ||
        values.audience_pain_points ||
        values.learning_goals ||
        'los temas mencionados';

    return `
Actúa como asistente de investigación experto en búsqueda y validación de fuentes confiables.

# CONTEXTO DE MI PROYECTO

Estoy creando un eBook sobre: **"${topic}"**
Público objetivo: ${audience}
Temas clave a cubrir: ${keyTopics}

# OBJETIVO

Necesito que me ayudes a IDENTIFICAR Y LISTAR las mejores fuentes de información disponibles sobre este tema.

# BÚSQUEDA ESTRATÉGICA DE FUENTES

Por favor, busca y recomienda fuentes en las siguientes categorías:

## 1. FUENTES ACADÉMICAS Y CIENTÍFICAS
- Artículos peer-reviewed (PubMed, Google Scholar, ResearchGate)
- Meta-análisis y revisiones sistemáticas (últimos 5 años prioritariamente)
- Estudios relevantes con datos cuantitativos
- Tesis doctorales o publicaciones universitarias

Para cada fuente proporciona:
- ✅ Título exacto
- ✅ Autores principales  
- ✅ Año de publicación
- ✅ DOI o link directo si disponible
- ✅ Resumen breve (2-3 líneas) de por qué es relevante

## 2. FUENTES INSTITUCIONALES OFICIALES
- Organizaciones reconocidas en el área
- Guías oficiales o protocolos
- Reportes gubernamentales o institucionales
- Asociaciones profesionales

## 3. LIBROS Y REFERENCIAS ESPECIALIZADAS  
- Libros escritos por expertos reconocidos
- Manuales técnicos o guías prácticas
- Ediciones recientes (últimos 10 años preferentemente)

## 4. DATOS Y ESTADÍSTICAS
- Bases de datos oficiales con cifras relevantes
- Reportes de mercado o estudios de industria (si aplica)
- Encuestas o investigaciones con datos duros

## 5. EXPERTOS Y AUTORIDADES
- Profesionales reconocidos en el área
- Conferencias, TEDx o presentaciones académicas relevantes
- Entrevistas o podcasts con contenido de valor

# CRITERIOS DE CALIDAD

Cada fuente debe cumplir:
- ✅ Alta credibilidad (autor, institución reconocida)
- ✅ Información actualizada
- ✅ Relevancia directa para "${audience}"
- ✅ Preferiblemente de acceso abierto (gratuito)
- ✅ Basada en evidencia sólida

# ORGANIZACIÓN POR TEMA

Agrupa las fuentes según los temas clave:
"${keyTopics}"

Ejemplo:
- **Tema A:** Fuentes 1, 3, 5
- **Tema B:** Fuentes 2, 4, 7
- etc.

# FORMATO DE SALIDA

Para cada fuente, usar este formato:

**[N]. [TÍTULO COMPLETO DE LA FUENTE]**
- **Autores:** [Nombres]
- **Año:** [YYYY]
- **Tipo:** [Artículo científico / Libro / Guía / Reporte / etc.]
- **Fuente:** [Revista / Editorial / Institución]
- **Link/DOI:** [URL completa o DOI]
- **Por qué es relevante:** [2-3 líneas]
- **Temas que cubre:** [Lista de temas del eBook]
- **Acceso:** [Gratuito / Paywall / Subscripción]

***

# RESULTADO ESPERADO

Una lista de **15-25 fuentes sólidas** que pueda:
1. Revisar para validar calidad
2. Descargar (PDFs, libros, reportes)
3. Cargar en NotebookLM
4. Usar para el análisis profundo del eBook

**INSTRUCCIONES DE FORMATO PARA EL ANÁLISIS POSTERIOR:**
- NO incluyas capítulos de "Índice" o "Estructura del eBook".
- El primer capítulo real debe ser siempre el "Capítulo 1".
- Mantén una numeración secuencial estricta.

¡Gracias por tu ayuda en esta investigación inicial! 🔍
`.trim();
}
