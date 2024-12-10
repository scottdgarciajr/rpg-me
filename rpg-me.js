import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";
import "@haxtheweb/rpg-character/rpg-character.js";

export class RpgMe extends DDDSuper(I18NMixin(LitElement)) {
  static get tag() {
    return "rpg-me";
  }

  constructor() {
    super();
    this.title = "";
    this.seed = this._getSeedFromUrl(); // Get the seed directly from the URL as a string
    this.characterProps = this._initializeCharacterPropsFromSeed(this.seed); // Use the seed string to initialize character properties
    this.t = {
      title: "Character Customization",
      seed: "Seed",
    };
    this.registerLocalization({
      context: this,
      localesPath:
        new URL("./locales/rpg-me.ar.json", import.meta.url).href + "/../",
      locales: ["ar", "es", "hi", "zh"],
    });
  }

  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
      seed: { type: String },
      characterProps: { type: Object },
    };
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
          color: var(--ddd-theme-primary);
          background-color: var(--ddd-theme-accent);
          font-family: var(--ddd-font-navigation);
        }
        .slider-container {
          margin-top: 16px;
        }
        .slider-label {
          display: block;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .slider {
          width: 100%;
        }
      `,
    ];
  }

  render() {
    return html`
      <div class="wrapper">
        <h3>${this.t.title}</h3>
        <rpg-character
          .accessories="${this.characterProps.accessories}"
          .height="${this.characterProps.height}"
          .width="${this.characterProps.width}"
          .base="${this.characterProps.base}"
          .face="${this.characterProps.face}"
          .faceItem="${this.characterProps.faceItem}"
          .hair="${this.characterProps.hair}"
          .pants="${this.characterProps.pants}"
          .shirt="${this.characterProps.shirt}"
          .skin="${this.characterProps.skin}"
          .hat="${this.characterProps.hat}"
          .hatColor="${this.characterProps.hatColor}"
          .walking="${this.characterProps.walking}"
          .leg="${this.characterProps.leg}"
          .speed="${this.characterProps.speed}"
          .circle="${this.characterProps.circle}"
          .fire="${this.characterProps.fire}"
          .demo="${this.characterProps.demo}"
        ></rpg-character>

        <div class="seed-inputs">
          <label for="seed">${this.t.seed}:</label>
          <input
            id="seed"
            type="text"
            .value="${this.seed}"
            readonly
          />
        </div>

        <div class="slider-container">
          ${this._renderSlider("Height", "height", 100, 200, this.characterProps.height)}
          ${this._renderSlider("Width", "width", 80, 150, this.characterProps.width)}
          ${this._renderSlider("Hair", "hair", 0, 10, this.characterProps.hair)}
          ${this._renderSlider("Pants", "pants", 0, 10, this.characterProps.pants)}
          ${this._renderSlider("Shirt", "shirt", 0, 10, this.characterProps.shirt)}
        </div>
      </div>
    `;
  }

  _renderSlider(label, property, min, max, value) {
    return html`
      <div class="slider-container">
        <label class="slider-label" for="${property}">${label} (${value})</label>
        <input
          id="${property}"
          class="slider"
          type="range"
          min="${min}"
          max="${max}"
          .value="${value}"
          @input="${(event) => this._onSliderChange(event, property)}"
        />
      </div>
    `;
  }

  _onSliderChange(event, property) {
    const newValue = parseInt(event.target.value, 10);
    this.characterProps = {
      ...this.characterProps,
      [property]: newValue,
    };
    this.seed = this._getSeedFromCharacterProps();
    this._updateSeedInUrl(this.seed);
    this.requestUpdate();
  }

  _initializeCharacterPropsFromSeed(seed) {
    return {
      height: parseInt(seed.substring(0, 3), 10) || 142,
      width: parseInt(seed.substring(3, 6), 10) || 113,
      hair: parseInt(seed.substring(6, 8), 10) || 0,
      pants: parseInt(seed.substring(8, 10), 10) || 0,
      shirt: parseInt(seed.substring(10, 12), 10) || 0,
      accessories: 0,
      base: 0,
      face: 0,
      faceItem: 0,
      skin: 0,
      hat: "none",
      hatColor: 0,
      walking: false,
      leg: "",
      speed: 500,
      circle: false,
      fire: false,
      demo: false,
    };
  }

  _getSeedFromCharacterProps() {
    const props = this.characterProps;
    return `${props.height.toString().padStart(3, "0")}${props.width
      .toString()
      .padStart(3, "0")}${props.hair.toString().padStart(2, "0")}${props.pants
      .toString()
      .padStart(2, "0")}${props.shirt.toString().padStart(2, "0")}`;
  }

  _getSeedFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("seed") || "1421130000"; // Default to a seed if not present
  }

  _updateSeedInUrl(seed) {
    const params = new URLSearchParams(window.location.search);
    params.set("seed", seed);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ path: newUrl }, "", newUrl);
  }
}

customElements.define(RpgMe.tag, RpgMe);
