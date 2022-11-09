<template>
    <defs>
        <filter id="drop-shadow">
            <feOffset result="offOut" in="SourceGraphic" dx="2" dy="2" />
            <feGaussianBlur result="blurOut" in="offOut" stdDeviation="2" />
            <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
        </filter>
        <filter id="blur5">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
        </filter>

    </defs>
</template>

<script setup>
</script>