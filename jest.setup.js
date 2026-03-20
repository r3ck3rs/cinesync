import '@testing-library/jest-dom'

// Polyfill TextEncoder/TextDecoder for jsdom environment (required by cheerio/undici)
import { TextEncoder, TextDecoder } from 'util'
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder
