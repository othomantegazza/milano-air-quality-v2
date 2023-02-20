# Proof of Concept Dashboard with Quarto

A proof-of-concept dashboard made with [Quarto](https://quarto.org/), R, Observable and D3 and deployed through Github Actions.

I started making this project inspired by the [great tutorial on dashboarding in R](https://github.com/RamiKrispin/deploy-flex-actions) by Rami Krispin.

I first developed [this other dashboard, on the same topic](https://github.com/othomantegazza/milano-air-quality), to test quarto capabilities when used with R and ggiraph.

This dashboard instead relies less on R graphical capabilities and more on Javascript and D3, to build custom, web-native visualization.

# Run

If you want to run this code locally:

1. Install [Quarto CLI](https://quarto.org/docs/get-started/) on your computer
2. Open [`air-quality.Rproj`](air-quality.Rproj) with Rstudio.
3. Run `renv::restore()` at the R console.
4. Run `quarto preview` at the command line terminal (shell).

# Data Source

This dashboard fetches daily the [Open Data on Air Pollution](https://dati.comune.milano.it/dataset/ds411-rilevazione-qualita-aria-2022) from the Open Data Portal of the City of Milano, I would like to thank them for providing well formatted and easy to reach Open Data.

On the other side, Air pollution is a huge issue in the area, and in my opinion, the initiatives on public transport and bicycle paths by the City of Milano, Regione Lombardia, and other the public administration entities are well below the level that would be needed to solve or even ease this issue.

# License

This main work comes with no warranty and is [LICENSED](LICENSE) under the CC4-BY-SA 4.0 license. Find the full text of the [license here](https://creativecommons.org/licenses/by-sa/4.0/legalcode).

The [color palette](data/tokyo-PARAVIEW.xml) is a [Scientific Color Map](https://zenodo.org/record/5501399), published by [Fabio Crameri], and made available also under the MIT Licensed.

The font used are:

- Aileron, by [Sora Sagano](http://www.dotcolon.net/), licensed under [CC0](https://www.fontsquirrel.com/fonts/aileron).
- Inconsolata, by Raph Levien, licensed under the [Open Font License](https://fonts.google.com/specimen/Inconsolata/about?category=Monospace).
