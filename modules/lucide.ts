import { defineNuxtModule, addComponent } from '@nuxt/kit';
import * as icons from 'lucide-vue-next';

export default defineNuxtModule({
    meta: {
        name: 'lucide-auto-import'
    },
    setup() {
        for (const key in icons) {
            if (key !== 'default' && key !== 'createLucideIcon' && !key.endsWith('Icon')) {
                addComponent({
                    name: key,                           // Allows using <Mail /> directly
                    export: key,                         // Will import { Mail }
                    filePath: 'lucide-vue-next',         // from 'lucide-vue-next'
                    priority: 1,                         // Silences override warning
                });
            }
        }
    }
});
