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
    this.characterSettings = this._getCharacterSettingsFromUrl();
    this.showShareOptions = false;
    this._hasRenderedOnce = false; // Flag to ensure only one delayed update
    console.debug('Constructor: Initialized characterSettings:', this.characterSettings);
  }

  static get properties() {
    return {
      characterSettings: { type: Object },
      showShareOptions: { type: Boolean },
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
        .character-preview, .inputs-panel {
          text-align: center;
        }
        rpg-character {
          margin-bottom: var(--ddd-spacing-3);
        }
        .inputs-panel {
          background-color: var(--ddd-theme-background-primary);
        }
        wired-combo, wired-checkbox, wired-slider, wired-button {
          display: block;
          margin-bottom: var(--ddd-spacing-4);
        }
        .seed-display {
          font-size: var(--ddd-font-size-s);
          margin-top: var(--ddd-spacing-2);
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex; justify-content: center; align-items: center;
          visibility: hidden; opacity: 0;
          transition: opacity 0.3s ease, visibility 0s 0.3s;
        }
        .modal-overlay.show { visibility: visible; opacity: 1; }
        .modal-content { background-color: var(--ddd-theme-background-primary); padding: var(--ddd-spacing-5); border-radius: var(--ddd-border-radius); width: 80%; max-width: 500px; text-align: center; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
        .share-option-button, .close-button { padding: var(--ddd-spacing-4); margin: var(--ddd-spacing-2); cursor: pointer; border-radius: var(--ddd-border-radius); color: #fff; width: 100%; text-align: center; transition: background-color 0.2s ease; }
        .close-button { background-color: var(--ddd-theme-secondary); }
        .share-option-button:hover { background-color: var(--ddd-theme-primary-hover); }
        .close-button:hover { background-color: var(--ddd-theme-secondary-hover); }
      `
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    console.debug('connectedCallback: Component connected to the DOM.');
    if (!this._hasRenderedOnce) {
      setTimeout(() => {
        console.debug('connectedCallback: Delayed update for characterSettings.');
        this.characterSettings = this._getCharacterSettingsFromUrl(); // Make sure it's called first
        this.requestUpdate();
        this._hasRenderedOnce = true;
      }, 500); // Delay the first render by 500ms
    }
  
    // Add listener for URL changes
    window.addEventListener("popstate", () => {
      console.debug('popstate event: URL changed, updating characterSettings.');
      this.characterSettings = this._getCharacterSettingsFromUrl(); // Update settings when URL changes
      this.requestUpdate();
    });
  }

  render() {
    console.debug('render: Rendering the component with characterSettings:', this.characterSettings);
    return html`
      <div class="container">
        <div class="character-preview">
          <rpg-character .seed="${this.characterSettings.seed}" .hat="${this.characterSettings.hat}" .base="${this.characterSettings.base}" .face="${this.characterSettings.face}" .hair="${this.characterSettings.hair}" .pants="${this.characterSettings.pants}" .shirt="${this.characterSettings.shirt}" .skin="${this.characterSettings.skin}" ?fire="${this.characterSettings.fire}" ?walking="${this.characterSettings.walking}" ?circle="${this.characterSettings.circle}" .size="${this.characterSettings.size}" demo aria-label="Character Preview"></rpg-character>
          <div class="seed-display" tabindex="0" aria-label="Current character seed">Seed: ${this.characterSettings.seed}</div>
        </div>
        <div class="inputs-panel">
          <h2>Customize Your Character</h2>
          ${this._renderSliders()}
          ${this._renderDropdownWithValues("Hat", "hat", ["none", "bunny", "coffee", "construction", "cowboy", "education", "knight", "ninja", "party", "pirate", "watermelon"])}
          <label for="size">Character Size:</label>
          <wired-slider id="size" .value="${this.characterSettings.size}" min="100" max="600" @change="${(e) => this._updateCharacterSetting('size', e.target.value)}" aria-labelledby="size" tabindex="0"></wired-slider>
          ${this._renderCheckbox("Fire", "fire")}
          ${this._renderCheckbox("Walking", "walking")}
          ${this._renderCheckbox("Circle", "circle")}
          <wired-button @click="${this._toggleShareOptions}" aria-label="Open share options" tabindex="0">Share</wired-button>
        </div>
      </div>
      ${this._renderShareModal()}
    `;
  }

  _renderSliders() {
    console.debug('_renderSliders: Rendering sliders for character settings.');
    const sliderData = [
      { label: "Accessories", key: "accessories", range: 9 },
      { label: "Has Hair", key: "base", range: 1 },
      { label: "Face", key: "face", range: 5 },
      { label: "Hair Color", key: "hair", range: 9 },
      { label: "Pants", key: "pants", range: 9 },
      { label: "Shirt", key: "shirt", range: 9 },
      { label: "Skin", key: "skin", range: 9 },
      { label: "Hat Color", key: "hatcolor", range: 9 },
    ];
  
    return sliderData.map(({ label, key, range }) => html`
      <div class="slider-row">
        <label for="${key}">${label}</label>
        ${key === "base" ? this._renderCheckbox(label, key) : html`
          <wired-slider id="${key}" .value="${this.characterSettings[key]}" min="0" max="${range}" @change="${(e) => this._updateCharacterSetting(key, e.target.value)}" tabindex="0"></wired-slider>`
        }
      </div>
    `);
  }

  _renderDropdownWithValues(label, key, values) {
    console.debug(`_renderDropdownWithValues: Rendering dropdown for ${label}.`);
    return html`
      <label for="${key}">${label}</label>
      <wired-combo id="${key}" value="${this.characterSettings[key] || 'none'}" @change="${(e) => this._updateCharacterSetting(key, e.target.value)}" tabindex="0">
        ${values.map(value => html`<wired-item value="${value}">${value.charAt(0).toUpperCase() + value.slice(1)}</wired-item>`)}
      </wired-combo>
    `;
  }

  _renderCheckbox(label, key) {
    console.debug(`_renderCheckbox: Rendering checkbox for ${label}.`);
    return html`
      <wired-checkbox id="${key}" .checked="${this.characterSettings[key]}" @change="${(e) => this._updateCharacterSetting(key, e.target.checked)}" tabindex="0">${label}</wired-checkbox>
    `;
  }

  _renderShareModal() {
    console.debug('_renderShareModal: Rendering share modal.');
    return html`
      <div class="modal-overlay ${this.showShareOptions ? 'show' : ''}">
        <div class="modal-content" role="dialog" aria-labelledby="modal-header" tabindex="0">
          <div class="modal-header" id="modal-header" aria-live="assertive">Share Your Character</div>
          ${["X", "LinkedIn"].map(platform => html`
            <wired-button class="share-option-button" @click="${() => this._shareOnSocialMedia(platform)}" aria-label="Share on ${platform}" tabindex="0">Share on ${platform}</wired-button>
          `)}
          <wired-button class="share-option-button" @click="${this._copyToClipboard}" aria-label="Copy character link" tabindex="0">Copy Link</wired-button>
          <wired-button class="close-button" @click="${this._toggleShareOptions}" aria-label="Close share options" tabindex="0">Close</wired-button>
        </div>
      </div>
    `;
  }

  _updateCharacterSetting(key, value) {
    console.debug(`_updateCharacterSetting: Updating ${key} with value: ${value}`);
    this.characterSettings = { ...this.characterSettings, [key]: value }; // Update the specific setting
    this._updateUrlWithSettings();
    this.requestUpdate(); // Trigger a UI update after settings change
  }

  _updateUrlWithSettings() {
    console.debug('_updateUrlWithSettings: Updating URL with characterSettings.');
    const urlParams = new URLSearchParams();
    Object.keys(this.characterSettings).forEach(key => urlParams.set(key, this.characterSettings[key]));
    history.pushState(null, '', '?' + urlParams.toString());
  }

  _toggleShareOptions() {
    console.debug('_toggleShareOptions: Toggling share options visibility.');
    this.showShareOptions = !this.showShareOptions;
  }

  _shareOnSocialMedia(platform) {
    console.debug(`_shareOnSocialMedia: Sharing on ${platform}.`);
    this._toggleShareOptions();
  }

  _copyToClipboard() {
    console.debug('_copyToClipboard: Copying URL to clipboard.');
    const textToCopy = window.location.href;
    navigator.clipboard.writeText(textToCopy).then(() => {
      this._toggleShareOptions();
    });
  }

  _getCharacterSettingsFromUrl() {
    console.debug('_getCharacterSettingsFromUrl: Getting character settings from URL.');
    const urlParams = new URLSearchParams(window.location.search);
    const settings = {
      size: urlParams.get("size") || 300,
      seed: urlParams.get("seed") || "randomSeed",
      hat: urlParams.get("hat") || "none",
      fire: urlParams.get("fire") === 'true',
      walking: urlParams.get("walking") === 'true',
      circle: urlParams.get("circle") === 'true',
      base: urlParams.get("base") === '1' ? 1 : 0,
      face: urlParams.get("face") || 0,
      // Include all relevant parameters
    };
    console.log('_getCharacterSettingsFromUrl: Retrieved settings:', settings);
    return settings;
  }
}

customElements.define(RpgMe.tag, RpgMe);
