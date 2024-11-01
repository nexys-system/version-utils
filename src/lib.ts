export interface Service {
  name: string;
  url: string;
  key?: string;
}

interface VersionOut {
  version: any;
  date: string;
  url: string;
}

export const getVersion = async (
  url: string,
  key?: string
): Promise<VersionOut> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  try {
    let json = await response.json();

    if (key) {
      json = json[key];
    }

    const { version, date = "-" } = json;

    return { version, date, url };
  } catch (error) {
    const contextError = new Error(
      `Failed to fetch version from ${url}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    if (error instanceof Error) {
      contextError.stack = error.stack;
    }
    console.warn("Version fetch failed:", contextError);
    throw contextError;
  }
};

export const printVersionTable = async (
  services: Service[],
  env: string = "prod"
) => {
  const headers = ["Env", ...services.map(({ name }) => name)];
  const headersString = headers.join("\t");

  console.log(headersString);
  const nHeaders = headersString.replace(/\t/g, " ".repeat(4)).length;
  console.log("=".repeat(nHeaders));

  const metas = await Promise.all(
    services.map(async ({ url }) => await getVersion(url))
  );
  const versions = metas.map(({ version }) => version);

  console.log([env, ...versions].join(" \t "));
};
