
import { nanoid } from 'nanoid';
import { Block } from '@/features/projects/types';

export type EbookSectionType =
    | 'cover'
    | 'copyright'
    | 'toc'
    | 'dedication'
    | 'prologue'
    | 'about-author'
    | 'references'
    | 'cta';

export const EBOOK_SECTION_TEMPLATES: Record<EbookSectionType, (projectData?: any) => Block[]> = {

    // 1. PORTADA UNIFICADA (Enfoque en Imagen)
    cover: (projectData) => [
        {
            id: nanoid(),
            type: 'cover',
            content: projectData?.title || '[TÍTULO DEL EBOOK]',
            properties: {
                subtitle: projectData?.subtitle || '[Subtítulo impactante del libro]',
                author: projectData?.author || '[Tu Nombre de Autor]',
                showText: true
            }
        },
        {
            id: nanoid(),
            type: 'page-break',
            content: ''
        }
    ],

    // 2. COPYRIGHT
    copyright: (projectData) => {
        const currentYear = new Date().getFullYear();
        const currentDate = new Date().toLocaleDateString('es-MX', {
            month: 'long',
            year: 'numeric'
        });

        return [
            {
                id: nanoid(),
                type: 'text',
                content: `**Copyright © ${currentYear} ${projectData?.author || '[Tu Nombre]'}**

Todos los derechos reservados.

**Primera Edición:** ${currentDate}

ISBN: [Añade tu ISBN aquí si aplica]

Ninguna parte de este libro puede ser reproducida, almacenada en un sistema de recuperación, o transmitida en cualquier forma o por cualquier medio, electrónico, mecánico, fotocopia, grabación o de otro tipo, sin el permiso previo por escrito del autor.

**Aviso Legal:**
Este libro tiene fines educativos e informativos. El contenido no sustituye el consejo médico, legal o financiero profesional. Consulta a un profesional calificado antes de tomar decisiones basadas en este libro.

**Contacto:**
Email: [tu@email.com]
Website: [www.tuweb.com]`,
                properties: { size: 'small' }
            },
            {
                id: nanoid(),
                type: 'page-break',
                content: ''
            }
        ];
    },

    // 3. TABLA DE CONTENIDOS
    toc: (projectData) => [
        {
            id: nanoid(),
            type: 'heading',
            content: 'Tabla de Contenidos',
            properties: { level: 1 }
        },
        {
            id: nanoid(),
            type: 'spacer',
            content: ''
        },
        {
            id: nanoid(),
            type: 'table-of-contents',
            content: `**Prólogo** ......................................................... [Página]

**Capítulo 1:** [Título del Capítulo 1] ........................ [Página]

**Capítulo 2:** [Título del Capítulo 2] ........................ [Página]

**Capítulo 3:** [Título del Capítulo 3] ........................ [Página]

**Capítulo 4:** [Título del Capítulo 4] ........................ [Página]

**Capítulo 5:** [Título del Capítulo 5] ........................ [Página]

**Conclusión** ...................................................... [Página]

**Sobre el Autor** ................................................. [Página]

**Referencias** ..................................................... [Página]

***

💡 **Tip:** Actualiza esta tabla manualmente después de añadir todos tus capítulos. En la versión de Kindle, los enlaces serán automáticos.`,
            properties: { isTOC: true }
        },
        {
            id: nanoid(),
            type: 'page-break',
            content: ''
        }
    ],

    // 4. DEDICATORIA
    dedication: (projectData) => [
        {
            id: nanoid(),
            type: 'heading',
            content: 'Dedicatoria',
            properties: { level: 2, align: 'center' }
        },
        {
            id: nanoid(),
            type: 'spacer',
            content: ''
        },
        {
            id: nanoid(),
            type: 'spacer',
            content: ''
        },
        {
            id: nanoid(),
            type: 'text',
            content: `*A [nombre o grupo de personas],*

*[Tu mensaje personal de dedicatoria. Ejemplo:]*

*A todas las mujeres que enfrentan desafíos de salud en silencio, buscando respuestas y esperanza. Este libro es para ustedes.*`,
            properties: { align: 'center', style: 'italic' }
        },
        {
            id: nanoid(),
            type: 'page-break',
            content: ''
        }
    ],

    // 5. PRÓLOGO
    prologue: (projectData) => [
        {
            id: nanoid(),
            type: 'heading',
            content: 'Prólogo',
            properties: { level: 1 }
        },
        {
            id: nanoid(),
            type: 'spacer',
            content: ''
        },
        {
            id: nanoid(),
            type: 'text',
            content: `[Párrafo 1: Hook - Empieza con una historia personal, estadística impactante o pregunta provocadora]

Hace [X] años, yo misma experimentaba [describe tu conexión personal con el tema]...

[Párrafo 2: El problema - Describe el problema que tu eBook resuelve]

Miles de personas sufren de [problema] sin saber que existe una solución...

[Párrafo 3: La solución - Introduce lo que van a aprender]

En este libro, descubrirás un sistema probado de [X] pasos que te ayudará a [beneficio principal]...

[Párrafo 4: Llamado a la acción - Invita al lector a comenzar]

Estás a punto de iniciar un viaje transformador. Lee con mente abierta, toma notas, y aplica lo que aprendas. Tu futuro yo te lo agradecerá.

— ${projectData?.author || '[Tu Nombre]'}  
${new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`
        },
        {
            id: nanoid(),
            type: 'page-break',
            content: ''
        }
    ],

    // 6. SOBRE EL AUTOR
    'about-author': (projectData) => [
        {
            id: nanoid(),
            type: 'page-break',
            content: ''
        },
        {
            id: nanoid(),
            type: 'heading',
            content: 'Sobre el Autor',
            properties: { level: 1 }
        },
        {
            id: nanoid(),
            type: 'spacer',
            content: ''
        },
        {
            id: nanoid(),
            type: 'text',
            content: `**${projectData?.author || '[Tu Nombre]'}** es [tu profesión/credenciales].

Con más de [X] años de experiencia en [tu campo], [Nombre] ha ayudado a [número] de personas a [logro principal].

[Párrafo sobre tu experiencia, formación, logros]

[Párrafo sobre tu misión y valores]

**Conéctate con ${projectData?.author || '[Tu Nombre]'}:**
- Email: [tu@email.com]
- Website: [www.tuweb.com]
- LinkedIn: [linkedin.com/in/tuperfil]
- Instagram: [@tuusuario]

**Otros libros del autor:**
- [Título del Libro 1]
- [Título del Libro 2]
- [Próximamente...]`
        }
    ],

    // 7. REFERENCIAS
    references: (projectData) => [
        {
            id: nanoid(),
            type: 'page-break',
            content: ''
        },
        {
            id: nanoid(),
            type: 'heading',
            content: 'Referencias y Bibliografía',
            properties: { level: 1 }
        },
        {
            id: nanoid(),
            type: 'spacer',
            content: ''
        },
        {
            id: nanoid(),
            type: 'text',
            content: `Este eBook fue elaborado con base en investigación científica, estudios médicos y literatura especializada.

**Principales fuentes consultadas:**

1. [Apellido, N.] ([Año]). *Título del estudio*. Journal Name, volumen(número), páginas.

2. [Autor] ([Año]). *Título del libro*. Editorial.

3. [Organización] ([Año]). *Título del reporte*. Recuperado de [URL]

4. [Apellido, N.] ([Año]). *Título del artículo*. Revista Científica, volumen(número), páginas. DOI: [doi]

5. [Fuente web] ([Fecha]). *Título del artículo*. Recuperado de [URL]

***

💡 **Nota:** Añade aquí todas las referencias específicas que usaste en tu investigación. Usa formato APA, MLA o el estándar de tu industria.`
        }
    ],

    // 8. CALL TO ACTION (Página final)
    cta: (projectData) => [
        {
            id: nanoid(),
            type: 'page-break',
            content: ''
        },
        {
            id: nanoid(),
            type: 'heading',
            content: '¿Te Gustó Este Libro?',
            properties: { level: 1, align: 'center' }
        },
        {
            id: nanoid(),
            type: 'spacer',
            content: ''
        },
        {
            id: nanoid(),
            type: 'text',
            content: `**Ayuda a otros a descubrirlo:**

⭐ **Deja una reseña en Amazon** - Tu opinión ayuda a otros lectores a encontrar este libro.

📧 **Suscríbete a mi newsletter** - Recibe contenido exclusivo, recursos adicionales y actualizaciones sobre nuevos libros.

👉 [www.tuweb.com/newsletter]

📱 **Sígueme en redes sociales:**
- Instagram: [@tuusuario]
- Facebook: [/tupagina]
- LinkedIn: [/tuperfil]

***

**¿Necesitas más ayuda?**

Si este libro te resultó útil, puedo ayudarte de otras formas:

- 🎓 **Cursos Online** - Programas profundos sobre [tu tema]
- 💼 **Consultoría 1-on-1** - Sesiones personalizadas
- 🎤 **Speaking / Conferencias** - Invítame a tu evento

Contacto: [tu@email.com]

***

**Gracias por leer. Ahora ve y aplica lo que aprendiste. 🚀**`
        }
    ]
};
