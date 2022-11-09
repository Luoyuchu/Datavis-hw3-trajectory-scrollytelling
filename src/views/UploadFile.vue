<template>
    <div class="container upload-file backgrounded">
        <div class="view-header backgrounded">
            <img class='lab-logo' src="../assets/logo.svg" />
            <div class="main-title">中国历代名人行迹地图</div>
            <div class="back-button" @click="backButtonClick">
                返回人物列表
            </div>
            <div class="bottom-line"></div>
        </div>

        <SemiBorderFrame class="preview-container backgrounded" header-align="left-2vh" header-padding="1.1rem">
            <template v-slot:header>
                <div style="font-size: 1.7rem">
                    上传内容预览
                </div>
            </template>
            <div class="addform-container">
                <AddForm :data="submitData"></AddForm>
            </div>
        </SemiBorderFrame>

        <div class="error-info-container" v-if="true || errorInfo && errorInfo.length > 0">
            <SemiBorderFrame header-align="left-2vh" header-padding="1.1rem">
                <template v-slot:header>
                    <div class="error-info__title" style="font-size: 1.7rem">错误信息</div>
                </template>
                <div class="error-info">
                    <div class="error-info__item" v-for="(item, index) in errorInfo" :key="index">
                        <div class="error-info__category">{{item[0]}}</div>
                        <div class="error-info__detail">{{item[1]}}</div>
                    </div>
                </div>
            </SemiBorderFrame>
        </div>

        <div class="upload backgrounded">
            <el-upload class="upload-widget" drag action="http://localhost:15893/upload_person_full"
                v-model:file-list="fileList" ref="uploadRef" :before-upload="beforeUpload" :on-change="onChange"
                :auto-upload="true" :http-request="() => {}">
                <div class="el-upload__icon">
                    <img src="@/assets/svg/upload-icon.svg" />
                </div>
                <div class="el-upload__text">
                    拖拽文件至此 或 <em>点击选择要上传的文件</em>
                </div>

                <template #tip>
                    <div class="el-upload__tip">
                        xlsx 文件 or json 文件
                    </div>
                </template>
            </el-upload>
            <el-button class="upload-button" type="success" @click="submitUpload" size="small">
                确认上传
            </el-button>
        </div>


    </div>


</template>

<script setup lang='ts'>

import ViewHeader from "@/components/ViewHeader.vue";
import * as Theme from "@/theme";
import { ref } from "vue";
import axios from "axios";
import * as XLSX from "xlsx";
import { ElMessage } from 'element-plus';
import { h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AddForm from "@/components/AddForm.vue";
import SemiBorderFrame from "@/components/SemiBorderFrame.vue";
import * as d3 from "d3";

const uploadRef = ref(null);
const fileList = ref([]);
const errorInfo = ref([]);
const router = useRouter();
const submitData = ref(null);

const parseFile = async function (file) {
    try {
        const getPersonInfoWorksheet = (worksheet) => {
            const attrs = ['name', 'dynasty', 'birth', 'death', 'info', 'contributor'];
            const data = {};
            for (let i = 0; i < attrs.length; ++i) {
                data[attrs[i]] = worksheet[`B${i + 1}`].v;
            }
            data.lifetime = [data.birth, data.death];
            return data;
        }
        const getTrajectoryWorksheet = (worksheet) => {
            const attrs = ['index', 'x_coord', 'y_coord', 'name', 'time_start', 'time_end', 'detail'];
            const cols = ['B', 'C', 'D', 'E', 'F', 'G', 'H'];
            const trajectory = [];
            for (let i = 1; ; ++i) {
                const iv = worksheet[`B${i + 7}`]?.v;
                if (!((typeof (iv) === 'string' || typeof (iv) === 'number') && iv !== '')) {
                    break;
                }
                const item = {};
                for (let j = 0; j < attrs.length; ++j) {
                    if ((attrs[j] === 'time_start' || attrs[j] === 'time_end') && worksheet[`${cols[j]}${i + 7}`]?.t === 'n' && worksheet[`${cols[j]}${i + 7}`]?.w.match(/\d+\/\d+\/\d\d/)) {
                        const d = new Date('1900-1-1');
                        const formater = d3.timeFormat("%Y/%m/%d");
                        const det = +worksheet[`${cols[j]}${i + 7}`]?.v;
                        item[attrs[j]] = formater(d.setDate(d.getDate() + det - 1 - (det >= 60)));
                    }
                    else {
                        item[attrs[j]] = worksheet[`${cols[j]}${i + 7}`]?.v;
                    }
                }
                item.year = [item.time_start, item.time_end];
                let blankFlag = true;
                for (let j of attrs.slice(1)) {
                    console.log(!!item[j], item[j]);
                    if (!!item[j]) {
                        blankFlag = false;
                    }
                }
                if (!blankFlag) {
                    trajectory.push(item);
                }
            }
            return trajectory;
        }
        const getPersonInfoJson = (json) => {
            const dataPersonInfo = {
                name: json.name,
                dynasty: json.dynasty,
                birth: json.lifetime[0],
                death: json.lifetime[1],
                info: json.info ?? '',
                contributor: json.contributor ?? '',
            }
            dataPersonInfo.lifetime = [dataPersonInfo.birth, dataPersonInfo.death];
            return dataPersonInfo;
        }
        const getTrajectoryJson = (json) => {
            const r = [];
            if (json.trajectory && json.trajectory instanceof Array) {
                for (let i of json.trajectory) {
                    const item = {
                        x_coord: i.y_coord,
                        y_coord: i.x_coord,
                        name: i.name,
                        time_start: i.year && ((i.year instanceof Array) ? i.year[0] : i.year),
                        time_end: i.year && ((i.year instanceof Array) ? i.year[1] : i.year),
                        detail: (i.detail instanceof Array) ? i.detail.join("\n") : i.detail,
                    };
                    item.year = [item.time_start, item.time_end];
                    r.push(item);
                }
            }
            return r;
        }
        const dataArrayBuffer = await file.arrayBuffer();
        if (file.name.indexOf('.json') !== -1) {
            const resBlob = new Blob([dataArrayBuffer])
            const reader = new FileReader()
            const data = await new Promise((resolve, reject) => {
                try {
                    reader.onload = () => {
                        try {
                            const r = JSON.parse(reader.result);
                            resolve(r);
                        }
                        catch (error) {
                            reject(error);
                        }
                    }
                    reader.readAsText(resBlob, "utf-8");
                }
                catch (error) {
                    reject(error);
                }

            });
            const r = getPersonInfoJson(data);
            r.trajectory = getTrajectoryJson(data);
            submitData.value = r;
        }
        else {
            const workbook = XLSX.read(dataArrayBuffer);
            const sheetNames = workbook.SheetNames;
            const worksheet = workbook.Sheets[sheetNames[0]];
            const dataPersonInfo = getPersonInfoWorksheet(worksheet);
            const dataTrajectory = getTrajectoryWorksheet(worksheet);
            debugger;
            let r = dataPersonInfo;
            r.trajectory = dataTrajectory;
            submitData.value = r;
        }
        console.log(submitData);

    }
    catch (error) {
        throw error;
        ElMessage({
            message: h('p', null, [
                h('span', null, '文件读取错误 '),
                h('i', { style: 'color: blue' }, '请上传基于分发修改的模板的xlsx文件，或联系助教咨询'),
            ]),
            type: "error"
        });
    }
}

const onChange = (file, files) => {
    const filename = file.name;
    const r = filename.match(/(.*\.json)|(.*\.xlsx)|(.*\.xls)/);
    if (!r) {
        ElMessage({
            message: '请上传json或xlsx文件',
            type: 'warning',
        });
        uploadRef.value.handleRemove(file);
        return;
    }
    if (files.length > 1) {
        uploadRef.value.handleRemove(files[0]);
    }
}


const backButtonClick = () => {
    router.push("/footprint")
};

const beforeUpload = (file: UploadRawFile) => {
    return new Promise(async (resolve, reject) => {
        await parseFile(file);
        reject();
    });

}

const submitUpload = () => {
    // axios.post("http://localhost:15893/upload_person_full", submitData.value).then((resp) => {
    axios.post("https://service-p0ngt945-1258678738.bj.apigw.tencentcs.com/release/upload_person_full", submitData.value).then((resp) => {
        errorInfo.value = resp.data.check_info;
        if (resp.data.succeed) {
            ElMessage({
                message: h('p', null, [
                    h('span', null, '上传成功 '),
                    h('i', { style: 'color: skyblue' }, '请等待跳转'),
                ]),
                type: 'success',
            });
            router.push(`/person/${resp.data.person_id}`);
        }
        else {
            ElMessage({
                message: h('p', null, [
                    h('span', null, '数据格式错误 '),
                    h('i', { style: 'color: skyblue' }, '请检查格式'),
                ]),
                type: 'warning',
            })
        }
    }).catch((error) => {
        ElMessage({
            message: h('p', null, [
                h('span', null, '网络错误 '),
                h('i', { style: 'color: skyblue' }, '请重试或联系助教'),
            ]),
            type: "error"
        });
    });
}

</script>

<style scoped lang="scss">
.container.upload-file {
    height: 100vh;
    width: 100vw;

    .view-header {
        position: relative;
        height: 8.3vh;
        width: 100vw;
        display: flex;
        align-items: center;
        font-family: FZQINGKBYSJF;
        color: v-bind('Theme.Color.mapDarkBrown');

        .lab-logo {
            margin-left: 2vw;
            display: inline-block;
            width: 4vw;
        }

        .main-title {
            font-size: 4vh;
            margin-left: 1vh;

        }

        .back-button {
            font-size: 2vh;
            padding: 0.5vh;
            border-radius: 0.2vh;
            border: 0.2vh solid #724a2b;
            margin-right: 4vh;
            margin-left: auto;
            flex-grow: 0;
            transition: all 0.2s ease;
            cursor: pointer;

            &:hover {
                transform-origin: center;
                transform: scale(1.1);
                box-shadow: 0 0 5px #724a2b;
            }
        }

        .bottom-line {
            position: absolute;
            bottom: 0vh;
            height: 0vh;
            left: 1.8vw;
            right: 1.8vw;
            border-bottom: 0.3vh solid #724a2b;
        }
    }


    .addform-container {
        height: 45vh;
        overflow-y: auto;
        margin: 1.5rem 0 1rem;
    }

    .preview-container {
        width: 95%;
        margin: auto;
    }

    .upload {
        width: 100vw;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-direction: column;
        position: relative;

        margin-top: 1vh;

        .upload-widget {

            .el-upload__icon {
                img {
                    width: 3vw;
                }
            }

            :deep(.el-upload-dragger) {
                height: 15vh;
                width: 15vw;
                padding: 0;
                display: flex;
                align-items: center;
                flex-direction: column;
                justify-content: center;
            }


        }

        .upload-button {
            margin: auto;
            margin-top: 2vh;
        }



    }

    .error-info-container {
        position: fixed;
        bottom: 1vh;
        width: 95%;
        margin-left: 2.5%;
    }

    .error-info {
        bottom: 0.5vh;
        // max-height: 15vh;
        height: 12vh;
        overflow-y: auto;
        margin-top: 1rem;

        &__title {
            font-family: v-bind("Theme.Font.basicFont");
            font-size: 1.2rem;
            line-height: 1.5;
            font-weight: 700;
        }

        &__item {
            border-bottom: solid #00000040 0.2px;
            font-size: 12px;
        }

        &__category {
            display: inline-block;
            // border: solid black 0.1vh;
            border-right: solid #00000040 0.2px;
            width: 15vw;
            font-weight: 700;
            color: v-bind("Theme.Color.mapDarkerBrown");
            height: 1.5em;
            padding-top: 0.1em;
        }

        &__detail {
            display: inline-block;
            width: 78vw;
            // border: solid black 0.1vh;
            border-right: none;
            height: 1.5em;
            padding-top: 0.1em;
        }

    }
}
</style>