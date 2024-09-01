# micropods

### Complete example of module federation with rspack, react, tailwind, shacdn

### Motivation

I was looking for a complete example of module federation which includes an UI library, a way to talk with an API, translations, a pub/sub system, but couldn't find any.

While there are [some great examples](https://github.com/module-federation/module-federation-examples), functionality is split among them.

Hence, I've started this repo with the motivation of helping others that are looking for a more complete example.

I have also written [this article](https://dev.to/stefan_moraru_871d86b9f9b/complete-module-federation-example-with-rspack-3pn3) which encapsulates all the lessons learned. You can also find the text for the article in the [ARTICLE.md](./ARTICLE.md) file.

### ✨ Features
- 🏎️ Build / development (rspack, pnpm)
- 🛣️ Routing (react-router-dom)
- 🎨 Reusable UI library (shacdn + tailwind)
- ☁️  Server integration (react-query)
- 📟 Pub/sub system (window custom events)
- 🌐 Translations (shared react-i18next)

### Implementation

#### Running the project

```sh
pnpm install

pnpm run dev
```

You'll notice that the pods are color-coded, in order to be able to see which module is loaded where. To see the assigned colors, you can look at the legend (bottom left).

The whole architecture / thought process behind the project is described in the article.

#### Shortcomings

- The `shell` module has to be running in order for everything to work properly
- Can't start the projects without the `micropods.config.ts` file
- In order to use `tailwind`, the `ui` module has to be running
- The project structure has to be consistent (root project with `micropods.config.ts` and all the modules inside the `pods` folder)

#### To-do list
- [ ] optimize bundle size (css, js included)
- [ ] pub/sub typescript types
- [ ] mock server
- [ ] git submodules (+ cli - cli integratepod repourl)
- [ ] ci/cd using github
- [ ] versioning system
- [ ] Shared state management
- [ ] Error management
- [ ] CLI (be able to create new pod / submodule)
- [ ] publish to npm
- [ ] use module federation runtime
- [x] types for the window object
- [x] dynamic pods configuration in orchestrator (specify remotes, also handle routing in config)
- [x] translations
- [x] global pub/sub system using dispatchEvent
- [x] shacdn
- [x] typescript
- [x] server library (with react-query)
- [x] ui library (tailwind)
- [x] routing in host (with react-router-dom)
- [x] be able to dynamically load pods from remote urls (and test using preivew-build, nothing should be from localhost)
- [x] pnpm scripts dev in parallel
