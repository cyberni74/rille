export function redirect301(request: Request, path: string) {
  return Response.redirect(new URL(path, request.url), 301);
}
