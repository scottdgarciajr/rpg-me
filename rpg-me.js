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

    // Extract the character settings from the URL or use default values
    this.characterSettings = this._generateSettingsFromUrl(urlParams);

    console.log("Initial Character Settings:", this.characterSettings);
    this.showShareOptions = false;
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
          background: var(--ddd-theme-default-gradient-hero);
          padding: 1rem;
          color: var(--ddd-theme-default-white);
        }

        .container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          padding: 2rem;
        }

        @media (min-width: var(--ddd-breakpoint-md)) {
          .container {
            grid-template-columns: 1fr 1fr;
          }
        }

        .character-preview {
          text-align: center;
          background: var(--ddd-theme-default-gradient-hero2);
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .inputs-panel {
          padding: 2rem;
          background: var(--ddd-theme-default-limestoneLight);
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        h2 {
          color: var(--ddd-theme-default-navy80);
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        wired-combo,
        wired-checkbox,
        wired-slider,
        wired-button {
          display: block;
          margin-bottom: 1rem;
        }

        wired-button {
          background: var(--ddd-theme-default-accent);
          color: var(--ddd-theme-default-white);
          border-radius: 4px;
        }

        wired-button:hover {
          background: var(--ddd-theme-default-beaver80);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }

        .modal-overlay.show {
          visibility: visible;
          opacity: 1;
        }

        .modal-content {
          background: var(--ddd-theme-default-shrineLight);
          padding: 2rem;
          border-radius: 8px;
          width: 80%;
          max-width: 500px;
          text-align: center;
        }

        .share-option-button {
          background: var(--ddd-theme-default-futureLime);
          padding: 0.75rem 1rem;
          border-radius: 4px;
          color: var(--ddd-theme-default-white);
          cursor: pointer;
        }

        .share-option-button:hover {
          background: var(--ddd-theme-default-discoveryCoral);
        }

        .close-button {
          margin-top: 1rem;
          background: var(--ddd-theme-default-error);
          color: var(--ddd-theme-default-white);
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
          style="transform: scale(${this.characterSettings.size / 100});"
          aria-label="Character Preview"
        ></rpg-character>

          <div class="seed-display" tabindex="0" aria-label="Current character seed">
            Seed: ${this.characterSettings.seed}
          </div>
        </div>

        <div class="inputs-panel">
          <h2>Customize Your Character</h2>
          ${this._renderBaseCheckbox("Base", "base")}
          ${this._renderSliderRow([
            { label: "Accessories", key: "accessories", range: 10 },
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
            max="310"
            @change="${(e) => this._updateCharacterSetting('size', e.target.value)}"
            @keydown="${this._onSliderKeydown}"
            aria-labelledby="size"
            tabindex="0"
          ></wired-slider>
          ${this._renderCheckbox("Fire", "fire")}
          ${this._renderCheckbox("Walking", "walking")}
          ${this._renderCheckbox("Circle", "circle")}
          <wired-button
            @click="${this._toggleShareOptions}"
            @keydown="${this._onButtonKeydown}"
            tabindex="0"
            aria-label="Open share options"
            >Share</wired-button
          >
        </div>
      </div>

      <!-- Modal for Share Options -->
      <div class="modal-overlay ${this.showShareOptions ? 'show' : ''}" aria-hidden="${!this.showShareOptions}">
        <div class="modal-content" role="dialog" aria-labelledby="modal-header" tabindex="0">
          <div class="modal-header" id="modal-header" aria-live="assertive">Share Your Character</div>
          
          <wired-button
            class="share-option-button"
            @click="${() => this._shareOnSocialMedia('X')}"
            @keydown="${this._onButtonKeydown}"
            tabindex="0"
            aria-label="Share on X"
            >Share on X</wired-button
          >
          <wired-button
            class="share-option-button"
            @click="${() => this._shareOnSocialMedia('LinkedIn')}"
            @keydown="${this._onButtonKeydown}"
            tabindex="0"
            aria-label="Share on LinkedIn"
            >Share on LinkedIn</wired-button
          >
          <wired-button
            class="share-option-button"
            @click="${this._copyToClipboard}"
            @keydown="${this._onButtonKeydown}"
            tabindex="0"
            aria-label="Copy character link"
            >Copy Link</wired-button
          >
          <wired-button
            class="close-button"
            @click="${this._toggleShareOptions}"
            @keydown="${this._onButtonKeydown}"
            tabindex="0"
            aria-label="Close share options"
            >Close</wired-button
          >
        </div>
      </div>
    `;
  }

  _onSliderKeydown(event) {
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      this._updateCharacterSetting(event.target.id, parseInt(event.target.value) + 1);
    } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      this._updateCharacterSetting(event.target.id, parseInt(event.target.value) - 1);
    }
  }

  _onButtonKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.target.click();
    }
  }

  _renderSliderRow(rows) {
    return rows.map(
      ({ label, key, range }) => html`
        <label for="${key}">${label}</label>
        <wired-slider
          id="${key}"
          .value="${this.characterSettings[key]}"
          min="0"
          max="${range}"
          @change="${(e) => this._updateCharacterSetting(key, e.target.value)}"
          aria-labelledby="${key}"
          tabindex="0"
        ></wired-slider>
      `
    );
  }

  _renderBaseCheckbox(label, key) {
    return html`
      <wired-checkbox
        id="${key}"
        ?checked="${this.characterSettings[key] === 1}"
        @change="${(e) => this._toggleBase(key, e.target.checked)}"
        tabindex="0"
      >
        ${label}
      </wired-checkbox>
    `;
  }
  _toggleBase(key, isChecked) {
    const newValue = isChecked ? 1 : 0;
    this._updateCharacterSetting(key, newValue);
  }
  

  _renderDropdownWithValues(label, key, values) {
    return html`
      <label for="${key}">${label}</label>
      <wired-combo id="${key}" .value="${this.characterSettings[key]}" @change="${(e) => this._updateCharacterSetting(key, e.target.value)}" tabindex="0">
        ${values.map((value) => html`<wired-item value="${value}">${value}</wired-item>`)}
      </wired-combo>
    `;
  }

  _renderCheckbox(label, key) {
    return html`
      <wired-checkbox
        id="${key}"
        ?checked="${this.characterSettings[key]}"
        @change="${(e) => this._updateCharacterSetting(key, e.target.checked)}"
        tabindex="0"
      >
        ${label}
      </wired-checkbox>
    `;
  }

  _updateCharacterSetting(key, value) {
    if (this.characterSettings[key] !== value) {
      this.characterSettings = { ...this.characterSettings, [key]: value };
      this._updateUrlParams();
    }
  }

  _updateUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(this.characterSettings)) {
      if (value) {
        urlParams.set(key, value);
      } else {
        urlParams.delete(key);
      }
    }
    history.replaceState(null, "", `?${urlParams.toString()}`);
  }

  _toggleShareOptions() {
    this.showShareOptions = !this.showShareOptions;
  }

  _shareOnSocialMedia(platform) {
    console.log(`Sharing on ${platform}...`);
  }

  _copyToClipboard() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      console.log("Link copied to clipboard");
    });
  }

  // Function to generate character settings from URL parameters
  _generateSettingsFromUrl(urlParams) {
    const generatedSettings = {
      base: parseInt(urlParams.get("base") || "0", 10),
      accessories: parseInt(urlParams.get("accessories") || "0", 10), // Added accessories
      face: parseInt(urlParams.get("face") || "0", 10),
      hair: parseInt(urlParams.get("hair") || "0", 10),
      pants: parseInt(urlParams.get("pants") || "0", 10),
      shirt: parseInt(urlParams.get("shirt") || "0", 10),
      skin: parseInt(urlParams.get("skin") || "0", 10),
      hat: urlParams.get("hat") || "none",
      size: parseInt(urlParams.get("size") || "100", 10),
      fire: urlParams.get("fire") === "true",
      walking: urlParams.get("walking") === "true",
      circle: urlParams.get("circle") === "true",
    };
    return generatedSettings;
  }
  
}

customElements.define(RpgMe.tag, RpgMe);
