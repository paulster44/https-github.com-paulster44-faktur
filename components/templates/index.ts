import { type Template } from '../../types';
import { modernTemplateCss } from './modern';
import { classicTemplateCss } from './classic';
import { minimalistTemplateCss } from './minimalist';

export const templates: Template[] = [
    {
        id: 'modern',
        name: 'Modern',
        css: modernTemplateCss,
    },
    {
        id: 'classic',
        name: 'Classic',
        css: classicTemplateCss,
    },
    {
        id: 'minimalist',
        name: 'Minimalist',
        css: minimalistTemplateCss,
    }
];
