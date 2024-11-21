import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";
import '@haxtheweb/rpg-character/rpg-character.js';

/**
 * `rpg-me`
 * 
 * @demo index.html
 * @element rpg-me
 */
export class RpgMe extends DDDSuper(I18NMixin(LitElement)) {

  static get tag() {
    return "rpg-me";
  }

  constructor() {
    super();
    this.title = "";
    this.seed = this.getSeedFromUrl() || "1111111111"; // Initialize seed from URL or default to "1111111111"
    this.t = this.t || {};
    this.t = {
      ...this.t,
      title: "Title",
      seed: "Seed",
    };
    this.registerLocalization({
      context: this,
      localesPath:
        new URL("./locales/rpg-me.ar.json", import.meta.url).href +
        "/../",
      locales: ["ar", "es", "hi", "zh"],
    });
    
    // Initialize character properties
    this.characterProps = {
      accessories: 0,
      height: 142,
      width: 113,
      base: 0,
      face: 0,
      faceItem: 0,
      hair: 0,
      pants: 0,
      shirt: 0,
      skin: 0,
      hat: "none",
      hatColor: 0,
      walking: false,
      leg: "",
      speed: 500,
      circle: false,
      fire: false,
      demo: false
    };
  }

  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
      seed: { type: String }, // Change seed to a string so each character can be modified
      characterProps: { type: Object }
    };
  }

  static get styles() {
    return [super.styles,
    css`
      :host {
        display: block;
        color: var(--ddd-theme-primary);
        background-color: var(--ddd-theme-accent);
        font-family: var(--ddd-font-navigation);
      }
      .wrapper {
        margin: var(--ddd-spacing-2);
        padding: var(--ddd-spacing-4);
      }
      h3 span {
        font-size: var(--rpg-me-label-font-size, var(--ddd-font-size-s));
      }
      .seed-inputs {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }
      input {
        width: 50px;
        text-align: center;
      }
      .character-inputs {
        margin-top: 20px;
      }
      .character-inputs label {
        display: block;
        margin-bottom: 5px;
      }
    `];
  }

  render() {
    return html`
      <div class="wrapper">
        <h3><span>${this.t.title}:</span> ${this.title}</h3>
        <rpg-character
          .seed="${this.seed}"
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
            @input="${this._onSeedChange}"
          />
        </div>

        <div class="character-inputs">
          <h4>Character Customization</h4>
          
          ${Object.keys(this.characterProps).map(prop => html`
            <label for="${prop}">
              ${prop.charAt(0).toUpperCase() + prop.slice(1)}:
              <input
                id="${prop}"
                type="number"
                .value="${this.characterProps[prop]}"
                @input="${(e) => this._onPropertyChange(e, prop)}"
                min="0"
                max="9"
              />
            </label>
          `)}
          
        </div>
        
        <slot></slot>
      </div>
    `;
  }

  _onPropertyChange(event, prop) {
    const value = event.target.value;
    this.characterProps[prop] = value;
    this._updateSeed();  // Update seed whenever a character property changes
    this.requestUpdate();
  }

  _onSeedChange(event) {
    this.seed = event.target.value;
    this.updateSeedInUrl(this.seed); // Update seed in URL when user changes it
    this.requestUpdate();
  }

  getSeedFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.has("seed") ? params.get("seed") : null;
  }

  updateSeedInUrl(seed) {
    const params = new URLSearchParams(window.location.search);
    params.set("seed", seed);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  }

  _updateSeed() {
    // A custom seed update logic based on characterProps changes
    const newSeed = `${this.characterProps.height}${this.characterProps.width}${this.characterProps.hair}${this.characterProps.pants}${this.characterProps.shirt}`;
    this.seed = newSeed;
    this.updateSeedInUrl(this.seed); // Update seed in URL whenever properties change
  }
}

globalThis.customElements.define(RpgMe.tag, RpgMe);
