// Import Modules
import { SimpleActor } from "./actor.js";
import { SimpleActorSheet } from "./actor-sheet.js";


Hooks.on("ready", async () => {

    game.twofourxx = {
        SimpleActor
    };

    // Define custom Document classes
    CONFIG.Actor.documentClass = SimpleActor;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("twofourxx", SimpleActorSheet, { makeDefault: true });

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

