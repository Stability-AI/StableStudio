var l = (t) => {
    let e,
      i = new Set(),
      r = (o, u) => {
        let s = typeof o == "function" ? o(e) : o;
        if (!Object.is(s, e)) {
          let g = e;
          (e = u ?? typeof s != "object" ? s : Object.assign({}, e, s)),
            i.forEach((p) => p(e, g));
        }
      },
      a = () => e,
      n = {
        setState: r,
        getState: a,
        subscribe: (o) => (i.add(o), () => i.delete(o)),
        destroy: () => {
          (import.meta.env && import.meta.env.MODE) !== "production" &&
            console.warn(
              "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
            ),
            i.clear();
        },
      };
    return (e = t(r, a, n)), n;
  },
  d = (t) => (t ? l(t) : l),
  c = (t) => (e) => d((i, r) => t({ set: i, get: r, context: e }));
var m = c(() => ({
  // manifest: {
  //   name: "Example Plugin",
  //   description: "An example plugin for StableStudio",
  //   version: "1.2.3",
  //   author: "Bobby Joe",
  //   license: "MIT",
  //   link: "https://github.com",
  //   icon: "place.dog/100/100",
  // },
  getStatus: () => ({
    indicator: "success",
    message: "This plugin is working",
  }),
  settings: {
    exampleSetting: {
      type: "string",
      default: "Hello, World!",
      placeholder: "Example setting",
    },
  },
}));
export { m as createPlugin };
//# sourceMappingURL=index.js.map
