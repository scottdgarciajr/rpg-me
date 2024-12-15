import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";
import { WiredButton, WiredCombo, WiredItem, WiredCheckbox, WiredSlider } from "wired-elements";
import "@haxtheweb/rpg-character/rpg-character.js";

export class RpgMe extends DDDSuper(I18NMixin(LitElement)) {
  static get tag() {
    return "rpg-me";
  }

  constructor() {
    super();
    const urlParams = new URLSearchParams(window.location.search);
    const urlSeed = urlParams.get("seed");
    this.characterSettings = {
      seed: urlSeed || "0000000000",
      base: 0,
      face: 0,
      faceItem: 0,
      hair: 0,
      pants: 0,
      shirt: 0,
      skin: 0,
      hatColor: 0,
      hat: "none",
      size: 200,
      fire: false,
      walking: false,
      circle: false,
    };
  }

  static get properties() {
    return {
      characterSettings: { type: Object },
    };
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
          font-family: var(--ddd-font-navigation);
          background-color: var(--ddd-theme-background-secondary);
          padding: var(--ddd-spacing-5);
        }
        .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--ddd-spacing-5);
        }
        .character-preview {
          text-align: center;
        }
        rpg-character {
          margin-bottom: var(--ddd-spacing-3);
        }
        .inputs-panel {
          padding: var(--ddd-spacing-5);
          background-color: var(--ddd-theme-background-primary);
        }
        wired-combo,
        wired-checkbox,
        wired-slider,
        wired-button {
          display: block;
          margin-bottom: var(--ddd-spacing-4);
        }
        .seed-display {
          font-size: var(--ddd-font-size-s);
          margin-top: var(--ddd-spacing-2);
        }
      `,
    ];
  }

  render() {
    return html`
      <div class="container">
        <div class="character-preview">
          <rpg-character
            .seed="${this.characterSettings.seed}"
            .hat="${this.characterSettings.hat}"
            .base="${this.characterSettings.base}"
            .face="${this.characterSettings.face}"
            .hair="${this.characterSettings.hair}"
            .pants="${this.characterSettings.pants}"
            .shirt="${this.characterSettings.shirt}"
            .skin="${this.characterSettings.skin}"
            ?fire="${this.characterSettings.fire}"
            ?walking="${this.characterSettings.walking}"
            ?circle="${this.characterSettings.circle}"
            .size="${this.characterSettings.size}"
            demo
          ></rpg-character>
          <div class="seed-display">Seed: ${this.characterSettings.seed}</div>
          ${console.log("Current Seed:", this.characterSettings.seed)}
        </div>

        <div class="inputs-panel">
          <h2>Customize Your Character</h2>
          ${this._renderSliderRow([
            { label: "Accessories", key: "base", range: 10 },
            { label: "Face", key: "face", range: 6 },
          ])}
          ${this._renderSliderRow([
            { label: "Hair", key: "hair", range: 10 },
            { label: "Pants", key: "pants", range: 10 },
          ])}
          ${this._renderSliderRow([
            { label: "Shirt", key: "shirt", range: 10 },
            { label: "Skin", key: "skin", range: 10 },
          ])}
          ${this._renderDropdownWithValues("Hat", "hat", [
            "none",
            "bunny",
            "coffee",
            "construction",
            "cowboy",
            "education",
            "knight",
            "ninja",
            "party",
            "pirate",
            "watermelon",
          ])}
          <label for="size">Character Size:</label>
          <wired-slider
            id="size"
            .value="${this.characterSettings.size}"
            min="100"
            max="600"
            @change="${(e) => this._updateCharacterSetting('size', e.target.value)}"
          ></wired-slider>
          ${this._renderCheckbox("Fire", "fire")}
          ${this._renderCheckbox("Walking", "walking")}
          ${this._renderCheckbox("Circle", "circle")}
          <wired-button @click="${this._generateShareLink}">Share</wired-button>
        </div>
      </div>
    `;
  }

  _renderSliderRow(options) {
    return html`
      <div class="slider-row">
        ${options.map(
          (option) => html`
            <label>${option.label}</label>
            <wired-slider
              .value="${this.characterSettings[option.key]}"
              min="0"
              max="${option.range - 1}"
              @change="${(e) => this._updateCharacterSetting(option.key, e.target.value)}"
            ></wired-slider>
          `
        )}
      </div>
    `;
  }

  _renderDropdownWithValues(label, key, values) {
    return html`
      <label>${label}</label>
      <wired-combo
        @selected="${(e) => this._updateCharacterSetting(key, e.detail.value)}"
      >
        ${values.map(
          (value) => html`<wired-item value="${value}">${value}</wired-item>`
        )}
      </wired-combo>
    `;
  }

  _renderCheckbox(label, key) {
    return html`
      <wired-checkbox
        ?checked="${this.characterSettings[key]}"
        @change="${(e) => this._updateCharacterSetting(key, e.target.checked)}"
      >
        ${label}
      </wired-checkbox>
    `;
  }

  _updateCharacterSetting(key, value) {
    this.characterSettings = { ...this.characterSettings, [key]: value };
    this.requestUpdate();
  }

  _generateShareLink() {
    const params = new URLSearchParams(this.characterSettings).toString();
    const link = `${window.location.origin}${window.location.pathname}?${params}`;
    navigator.clipboard.writeText(link);
    alert("Link copied to clipboard!");
  }
}

globalThis.customElements.define(RpgMe.tag, RpgMe);
