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

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.3s ease, visibility 0s 0.3s;
        }
        .modal-overlay.show {
          visibility: visible;
          opacity: 1;
          transition: opacity 0.3s ease;
        }
        .modal-content {
          background-color: var(--ddd-theme-background-primary);
          padding: var(--ddd-spacing-5);
          border-radius: var(--ddd-border-radius);
          width: 80%;
          max-width: 500px;
          text-align: center;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }
        .modal-header {
          font-size: var(--ddd-font-size-l);
          margin-bottom: var(--ddd-spacing-4);
          color: var(--ddd-theme-text-primary);
        }
        .share-option-button {
          background-color: var(--ddd-theme-primary);
          padding: var(--ddd-spacing-4);
          margin: var(--ddd-spacing-2);
          cursor: pointer;
          border-radius: var(--ddd-border-radius);
          color: #fff;
          width: 100%;
          text-align: center;
          transition: background-color 0.2s ease;
        }
        .share-option-button:hover {
          background-color: var(--ddd-theme-primary-hover);
        }
        .close-button {
          background-color: var(--ddd-theme-secondary);
          color: #fff;
          padding: var(--ddd-spacing-3);
          border-radius: var(--ddd-border-radius);
          margin-top: var(--ddd-spacing-3);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .close-button:hover {
          background-color: var(--ddd-theme-secondary-hover);
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
            aria-label="Character Preview"
          ></rpg-character>
          <div class="seed-display" tabindex="0" aria-label="Current character seed">
            Seed: ${this.characterSettings.seed}
          </div>
        </div>

        <div class="inputs-panel">
          <h2>Customize Your Character</h2>
          ${this._renderSliderRow([
            { label: "Accessories", key: "accessories", range: 9 },
            { label: "Has Hair", key: "base", range: 1},
            { label: "Face", key: "face", range: 5 },
            { label: "Face Item", key: "faceitem", range: 9 },
            { label: "Hair Color (must have hair)", key: "hair", range: 9 },
            { label: "Pants", key: "pants", range: 9 },
            { label: "Shirt", key: "shirt", range: 9 },
            { label: "Skin", key: "skin", range: 9 },
            { label: "Hat Color", key: "hatcolor", range: 9 },
            { label: "Leg", key: "leg", range: 0, disabled: true }
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
 

  _renderSliderRow(sliders) {
    return sliders.map(
      ({ label, key, range, min = 0, disabled = false }) => {
        if (key === "base") {
          // Replace the slider with a checkbox for the "base" property
          return html`
            <div class="slider-row">
              <label for="${key}">${label}</label>
              <wired-checkbox
                id="${key}"
                .checked="${this.characterSettings[key] === 1}"
                @change="${(e) => this._updateCharacterSetting(key, e.target.checked ? 1 : 0)}"
                tabindex="0"
                aria-labelledby="${key}"
              >
                ${label}
              </wired-checkbox>
            </div>
          `;
        } else {
          return html`
            <div class="slider-row">
              <label for="${key}">${label}</label>
              <wired-slider
                id="${key}"
                .value="${this.characterSettings[key]}"
                min="${min}"
                max="${range}"
                @change="${(e) => this._updateCharacterSetting(key, e.target.value)}"
                ?disabled="${disabled}"
                tabindex="0"
                aria-labelledby="${key}"
              ></wired-slider>
            </div>
          `;
        }
      }
    );
  }
  

  _renderDropdownWithValues(label, key, values) {
    return html`
      <label for="${key}">${label}</label>
      <wired-combo
        id="${key}"
        value="${this.characterSettings[key] || 'none'}"
        @change="${(e) => this._updateCharacterSetting(key, e.target.value)}"
        tabindex="0"
        aria-labelledby="${key}"
      >
        ${values.map(
          (value) =>
            html`<wired-item value="${value}">${value.charAt(0).toUpperCase() + value.slice(1)}</wired-item>`
        )}
      </wired-combo>
    `;
  }

  _renderCheckbox(label, key) {
    return html`
      <wired-checkbox
        id="${key}"
        .checked="${this.characterSettings[key]}"
        @change="${(e) => this._updateCharacterSetting(key, e.target.checked)}"
        tabindex="0"
        aria-labelledby="${key}"
      >
        ${label}
      </wired-checkbox>
    `;
  }

  _updateCharacterSetting(key, value) {
    this.characterSettings = {
      ...this.characterSettings,
      [key]: value,
    };
    this._updateUrlWithSettings();
  }

  _updateUrlWithSettings() {
    const urlParams = new URLSearchParams();
    for (const key in this.characterSettings) {
      urlParams.set(key, this.characterSettings[key]);
    }
    history.pushState(null, '', '?' + urlParams.toString());
  }

  _onSliderKeydown(event) {
    if (event.key === 'Enter') {
      event.target.dispatchEvent(new Event('change'));
    }
  }

  _onButtonKeydown(event) {
    if (event.key === 'Enter') {
      event.target.click();
    }
  }

  _toggleShareOptions() {
    this.showShareOptions = !this.showShareOptions;
  }

  _shareOnSocialMedia(platform) {
    console.log(`Sharing on ${platform}`);
    this._toggleShareOptions();
  }

  _copyToClipboard() {
    const textToCopy = window.location.href;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        console.log('URL copied to clipboard');
        this._toggleShareOptions();
      },
      (err) => console.error('Error copying text: ', err)
    );
  }

  _generateSettingsFromUrl(urlParams) {
    return {
      size: urlParams.get("size") || 300,
      seed: urlParams.get("seed") || "randomSeed",
      hat: urlParams.get("hat") || "none",
      fire: urlParams.get("fire") === 'true',
      walking: urlParams.get("walking") === 'true',
      circle: urlParams.get("circle") === 'true',
      base: urlParams.get("base") === '1' ? 1 : 0,  // Default to 1 or 0 based on URL
    };
  }
  
}

customElements.define(RpgMe.tag, RpgMe);
