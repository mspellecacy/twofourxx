// Import Modules
import { SimpleActor } from "./actor.js";
import { SimpleItem } from "./item.js";
import { SimpleItemSheet } from "./item-sheet.js";
import { SimpleActorSheet } from "./actor-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { createTwofourxxMacro } from "./macro.js";
import { SimpleToken, SimpleTokenDocument } from "./token.js";

Hooks.on("ready", async () => {
    /**
     * Set an initiative formula for the system. This will be updated later.
     * @type {String}
     */
    CONFIG.Combat.initiative = {
        formula: "1d20",
        decimals: 2
    };

    game.twofourxx = {
        SimpleActor,
        createTwofourxxMacro
    };

    // Define custom Document classes
    CONFIG.Actor.documentClass = SimpleActor;
    CONFIG.Token.documentClass = SimpleTokenDocument;
    CONFIG.Token.objectClass = SimpleToken;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("twofourxx", SimpleActorSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("twofourxx", SimpleItemSheet, { makeDefault: true });

    // Register system settings
    game.settings.register("twofourxx", "macroShorthand", {
        name: "SETTINGS.SimpleMacroShorthandN",
        hint: "SETTINGS.SimpleMacroShorthandL",
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });

    // Register initiative setting.
    game.settings.register("twofourxx", "initFormula", {
        name: "SETTINGS.SimpleInitFormulaN",
        hint: "SETTINGS.SimpleInitFormulaL",
        scope: "world",
        type: String,
        default: "1d20",
        config: true,
        onChange: formula => _simpleUpdateInit(formula, true)
    });

    // Retrieve and assign the initiative formula setting.
    const initFormula = game.settings.get("twofourxx", "initFormula");
    _simpleUpdateInit(initFormula);

    /**
     * Update the initiative formula.
     * @param {string} formula - Dice formula to evaluate.
     * @param {boolean} notify - Whether or not to post nofications.
     */
    function _simpleUpdateInit(formula, notify = false) {
        const isValid = Roll.validate(formula);
        if ( !isValid ) {
            if ( notify ) ui.notifications.error(`${game.i18n.localize("SIMPLE.NotifyInitFormulaInvalid")}: ${formula}`);
            return;
        }
        CONFIG.Combat.initiative.formula = formula;
    }

    /**
     * Slugify a string.
     */
    Handlebars.registerHelper('slugify', function(value) {
        return value.slugify({strict: true});
    });

    // foundry's selectOptions helper is poopy for my very basic needs.
    Handlebars.registerHelper('select', function(selected, option) {
        return (selected == option) ? 'selected' : '';
    });

    // Preload template partials
    await preloadHandlebarsTemplates();
});

/**
 * Adds the actor template context menu.
 */
Hooks.on("getActorDirectoryEntryContext", (html, options) => {

    // Define an actor as a template.
    options.push({
        name: game.i18n.localize("SIMPLE.DefineTemplate"),
        icon: '<i class="fas fa-stamp"></i>',
        condition: li => {
            const actor = game.actors.get(li.data("documentId"));
            return !actor.isTemplate;
        },
        callback: li => {
            const actor = game.actors.get(li.data("documentId"));
            actor.setFlag("twofourxx", "isTemplate", true);
        }
    });

    // Undefine an actor as a template.
    options.push({
        name: game.i18n.localize("SIMPLE.UnsetTemplate"),
        icon: '<i class="fas fa-times"></i>',
        condition: li => {
            const actor = game.actors.get(li.data("documentId"));
            return actor.isTemplate;
        },
        callback: li => {
            const actor = game.actors.get(li.data("documentId"));
            actor.setFlag("twofourxx", "isTemplate", false);
        }
    });
});

