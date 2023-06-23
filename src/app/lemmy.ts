import { LemmyHttp } from "lemmy-js-client";

import { environment } from "@environment";

export function getClient(url: string = environment.instance): LemmyHttp {
    const baseUrl = `${location.origin}/api/${url}`;
    return new LemmyHttp(baseUrl);
}