import * as yup from 'yup';

/**
 * An object containing the available language options.
 */
export const LANGUAGE = {
   EN: 'en_us',
   VI: 'vi_vn',
} as const;

/**
 * An array of all available languages.
 */
export const LANGUAGES = Object.values(LANGUAGE);

/**
 * Defines the schema for the available languages.
 */
export const LanguageSchema = yup.string().oneOf(Object.values(LANGUAGE)).required();

/**
 * Represents the inferred type of the `LanguageSchema`.
 */
export type Language = yup.InferType<typeof LanguageSchema>;

export const LOCALSTORAGE_LANGUAGE_KEY = 'language';
