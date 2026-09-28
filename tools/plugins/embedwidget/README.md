# EmbedWidget Plugin

This DA plugin accepts a TradingView embed snippet and converts it to a structured `tradingview` block table.

## Why this plugin exists

- Authors can still use familiar copy/paste workflows from TradingView.
- Documents receive structured block content, not raw custom HTML.
- Developers retain a safer, maintainable content model.

## Files

```
tools/plugins/embedwidget/
├── embedwidget.html
├── embedwidget.css
├── embedwidget.js
└── README.md
```

## Supported input

- TradingView embed snippet containing a script from `https://s3.tradingview.com/.../embed-widget-*.js`

## TradingView widget references

- Sample widgets catalog: [TradingView Widgets Collection](https://www.tradingview.com/widget-docs/widgets/)
- Current widget example used by this plugin workflow: [Company Profile widget](https://www.tradingview.com/widget-docs/widgets/symbol-details/company-profile/)

## Inserted output

The plugin inserts a `tradingview` block table with rows:

- `script`
- `height`
- `config` (JSON)

## Local DA test URL

Replace org/repo as needed:

`https://da.live/app/{org}/{repo}/tools/plugins/embedwidget/embedwidget?ref=local`

## DA library config row (example)

| title | path | format | icon | experience | ref |
| --- | --- | --- | --- | --- | --- |
| EmbedWidget (local) | http://localhost:3000/tools/plugins/embedwidget/embedwidget.html | local | | | |
