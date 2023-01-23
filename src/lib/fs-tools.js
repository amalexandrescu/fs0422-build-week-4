import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";

const { createReadStream } = fs;

const expJSONPath = "http://localhost:3001/users/63ce71322d24291c669fab27/experiences/";

export const getExpJsonReadableStream = () => createReadStream(expJSONPath);
