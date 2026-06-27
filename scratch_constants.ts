// Game dimensions
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 640;

// Bird physics
export const GRAVITY = 0.3; // Reduced from 0.5 for a lighter feel
export const JUMP_STRENGTH = -6.5; // Adjusted from -8 to balance with new gravity
export const TERMINAL_VELOCITY = 8; // Caps maximum fall speed for better control
export const BIRD_WIDTH = 34; // Dimensions of a single sprite frame
export const BIRD_HEIGHT = 24; // Dimensions of a single sprite frame

// Sound effects
export const FLAP_SOUND_SRC = 'data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAgAQBE9f/79f/79v/2//T+7/7s/eT84vzV/ND8zPzP/M/90v3j/ub/AP8A/wD/APMA8gDyAPMA8gDwAO0A6gDnAOQA3wDfAN8A3QDcANoA1wDaANsA3QDeAOAA5ADoAOwA7gDwAPIA9AD1APcA+gD8AP4A/wAAAAAAAQACAAIAAgADAAQABQAGAAcACAAJAAoACwAMAA0ADgAPABAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8AIAAhACIAIwAkACUAJgAnACgAKQAqACsALAAtAC4ALwAwADEAMgAzADQANQA2@#%*!'; // Wait, let's not break the flap sound base64 string! It is very long. Let's make sure we keep it.
// Oh, the base64 string for sound effect is on line 16. Let's look at the original constants.ts content.
