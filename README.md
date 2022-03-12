# grammy-workflow 👨‍🔧
> *Redefining the way you work with Grammy.*

This Package tries to provide a more convenient way to work with complex workflows when using Grammy to program Telegram bots.

There is a good starting point when working with Grammy and using the router-Plugin. We had the need to take that step a bit further and create a WorkflowEngine that is a little more opinionated in how you define Workflows and it's steps (Routes). We also added a convenient way to have the typings for every step and workflow defined.

## Pros
- Easy to understand
- Opinionated Sessionhandling
- Reusable steps in different Workflows

## What is a step?
A step is a defined amount of Grammy-Listeners (`bot.on(...)`) that can react to different types of updates. They define the data structure they might need and keep all listeners bundled to a single class thus enforcing good programming practice not keeping all Grammy-Listeners in one bloated file.

## What is a workflow?
A workflow itself is a defined amount of Steps that are available in this specific workflow.

> Remember: Steps are always reusable! You can have common steps for multiple workflows that do get reused 😏

# Getting Started
## Install
```
npm install --save @enyineer/grammy-workflow

or

yarn add @enyineer/grammy-workflow
```

## How does this plugin work?
For me the best way to get started is to just look at an example. We provided a fully working example bot in the [example folder](https://github.com/enyineer/grammy-workflow/tree/main/example).

You should specifically look at the [example workflow](https://github.com/enyineer/grammy-workflow/blob/main/example/src/example.ts) and the [example steps](https://github.com/enyineer/grammy-workflow/tree/main/example/src/steps).

This docs and the comments for this package will soon get refined to include more info. PRs for this are also welcome ❤️

# Contribute
Contributions are always welcome and needed. If you'd like to change anything, please just open a PR and we'll have a look at it ASAP.
