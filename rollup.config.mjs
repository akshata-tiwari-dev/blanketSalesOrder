import typescript from '@rollup/plugin-typescript';

const externalModules = [
    '@uif-js/core/jsx-runtime',
    '@uif-js/core',
    '@uif-js/component'
]

const bannerContent = `/**
 * Copyright (c) 2024 Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */`

export default [
    {
        input: 'src/TypeScript/app/feature/SPATSJSX/main/SpaClient.ts',
        output: {
            file: 'src/FileCabinet/SuiteApps/com.netsuite.blanketsalesorder/src/feature/SPATSJSX/main/SpaClient.js',
            format: 'amd',
            // banner: bannerContent // use banner if needed
        },
        plugins: [
            typescript({
                tsconfig: './tsconfig.rollup.json'
            })
        ],
        external: externalModules // to remove "Unresolved dependencies" warning
    }
];
