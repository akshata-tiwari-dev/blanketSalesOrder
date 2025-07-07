/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

import * as https from 'N/https';

/**
 * Called when page loads — also makes triggerMapReduce globally available.
 */
export function pageInit(context) {
    window.triggerMapReduce = triggerMapReduce;
}

/**
 * Actual function triggered from the Suitelet's button.
 */
export function triggerMapReduce() {
    const scriptId = 'customscript161';
    const deploymentId = 'customdeploy1';

    const baseUrl = window.location.origin;
    const url = `${baseUrl}/app/site/hosting/scriptlet.nl?script=${scriptId}&deploy=${deploymentId}&action=runmr`;

    https.get.promise({ url })
        .then(response => {
            alert('Sales Order generation started. Please refresh the page to see the results.');
            location.reload();
        })
        .catch(error => {
            alert(`Error triggering Map/Reduce: ${error.message}`);
        });
}
