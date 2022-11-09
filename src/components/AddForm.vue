<template>
  <div class="container addform">
    <div class="personInfoBox">
      <div class="title">人物信息</div>
      <div class="formOuterBox">
        <div class="formCotantBox">
          <el-form label-width="80px">
            <div class="form-content backgrounded">
              <el-form-item label="姓名">
                <el-input v-model="personInfo.name" disabled></el-input>
              </el-form-item>
              <el-form-item label="朝代">
                <el-input v-model="personInfo.dynasty" disabled></el-input>
              </el-form-item>
              <el-form-item label="出生年份">
                <el-input v-model="personInfo.birth" disabled></el-input>
              </el-form-item>
              <el-form-item label="去世年份">
                <el-input v-model="personInfo.death" disabled></el-input>
              </el-form-item>
              <el-form-item label="收集者">
                <el-input v-model="personInfo.contributor" disabled></el-input>
              </el-form-item>
              <el-form-item label="人物简介">
                <el-input v-model="personInfo.info" disabled></el-input>
              </el-form-item>
            </div>

          </el-form>
        </div>

      </div>
    </div>
    <div class="addFormBox">
      <div class="title">行迹信息</div>
      <!-- 循环data中定义的数组 -->
      <div v-for="(item,index) in formLabelAlign" :key="index">
        <div class="formOuterBox">
          <div class="formCotantBox">
            <!-- <h3>行迹 {{index+1}}</h3> -->
            <!-- 表单内容 -->
            <el-form label-width="80px">
              <div class="location backgrounded">
                <el-form-item label="经度">
                  <el-input v-model="item.x_coord" disabled></el-input>
                </el-form-item>
                <el-form-item label="纬度">
                  <el-input v-model="item.y_coord" disabled></el-input>
                </el-form-item>
                <el-form-item label="所在地名">
                  <el-input v-model="item.name" disabled></el-input>
                </el-form-item>
                <el-form-item label="到达年份">
                  <el-input v-model="item.time_start" disabled></el-input>
                </el-form-item>
                <el-form-item label="离开年份">
                  <el-input v-model="item.time_end" disabled></el-input>
                </el-form-item>
                <el-form-item label="详细说明">
                  <el-input v-model="item.detail" disabled></el-input>
                </el-form-item>
                <div>
                  <!-- <el-button class ="control" @click="addForm" type="success">添加行迹</el-button> -->
                  <!-- <el-button v-if="index!=0" @click="removeIdx(item, index)" type="danger">删除此条行迹</el-button> -->
                </div>
              </div>
            </el-form>
          </div>
          <!-- 操作按钮 -->
        </div>
      </div>
    </div>
  </div>
</template>
  

<script setup>
import { defineProps, reactive, ref, computed, watch } from "vue";


const props = defineProps(['data']);
const personInfo = ref({
  name: '',
  dynasty: '',
  birth: '',
  death: '',
  info: '',
  contributor: '',

});
const formLabelAlign = ref([
  {
    x_coord: '',
    y_coord: '',
    name: '',
    time_start: '',
    time_end: '',
    detail: '',
  }
]);

watch(() => props.data, (newVal) => {
  const p = {};
  p.name = newVal?.name;
  p.dynasty = newVal?.dynasty;
  p.birth = newVal?.birth;
  p.death = newVal?.death;
  p.info = newVal?.info;
  p.contributor = newVal?.contributor;
  personInfo.value = p;
  const rr = [];
  if (newVal?.trajectory instanceof Array) {
    for (let i of newVal.trajectory) {
      let r = {};
      r.x_coord = i.x_coord;
      r.y_coord = i.y_coord;
      r.time_start = i.time_start;
      r.time_end = i.time_end;
      r.detail = i.detail;
      r.name = i.name;
      rr.push(r);
    }
  }
  formLabelAlign.value = rr;
}, {
  deep: true,
})


</script>

<script>
export default {
  name: "AddForm",
  data() {
    return {
      // 表单绑定数据
      formLabelAlign: [
        {
          x_coord: "",
          y_coord: "",
          name: "",
          year_0: "",
          year_1: "",
          detail: ""
        },
      ],
      personInfo: {
        name: "",
        dynasty: "",
        birth: "",
        death: ""
      }
    };
  },
  methods: {
    //   添加操作
    addForm() {
      // 定义一个标识，通过标识判断是否能添加信息
      let statusType = true;
      this.formLabelAlign.forEach((item) => {
        console.log(this.personInfo)
        if (
          item.x_coord == "" ||
          item.y_coord == "" ||
          item.name == "" ||
          item.year_0 == "" ||
          item.year_1 == "" ||
          item.detail == ""
        ) {
          this.$message({
            message: "请完善信息后添加",
            type: "warning",
          });
          statusType = false;
        }
      });
      if (statusType) {
        this.formLabelAlign.push({
          x_coord: "",
          y_coord: "",
          name: "",
          year_0: "",
          year_1: "",
          detail: ""
        });
      }
    },
    // 删除操作
    removeIdx(item, index) {
      this.formLabelAlign.splice(index, 1);
      this.$message({
        message: "删除成功",
        type: "success",
      });
    },
  },
};
</script>
  
<style scoped lang="scss">
h1 {
  padding-bottom: 2vh;
}

.personInfoBox {
  position: relative;
  font-family: FZQINGKBYSJF;
  color: #724a2b;
}

.title {
  font-size: 1.5rem;
  padding: 0.5rem;

}

.form-content {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.addFormBox {
  position: relative;
  font-family: FZQINGKBYSJF;
  margin: auto;
  color: #724a2b;
  /* margin: 20px; */
}

.formOuterBox {
  /* margin-bottom: 20px; */
  /* padding: 30px 40px; */
  background: white;
  border-radius: 30px;
}

.location {
  display: flex;
  justify-content: center;
}

.control {
  position: relative;
  border: none;
  background-color: #724a2b;
  left: 0;
  font-family: FZQINGKBYSJF;
}

.control:hover {
  background-color: #AD9D8F;
}

.control:active {
  background-color: #AD9D8F;
}

.control:focus {
  background-color: #724a2b;
}
</style>
  
  