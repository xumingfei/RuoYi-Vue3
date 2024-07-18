<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="isbn" prop="isbn">
        <el-input
            v-model="queryParams.isbn"
            placeholder="请输入isbn"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="书名" prop="bookName">
        <el-input
            v-model="queryParams.bookName"
            placeholder="请输入书名"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input
            v-model="queryParams.author"
            placeholder="请输入作者"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <!--        <el-input-->
        <!--            v-model="queryParams.category"-->
        <!--            placeholder="请输入分类 社科/科普/少儿"-->
        <!--            clearable-->
        <!--            @keyup.enter="handleQuery"-->
        <!--        />-->
        <el-select v-model="queryParams.category" placeholder="请选择下拉选择" clearable :style="{width: '200px'}">
          <el-option v-for="(item, index) in categoryOptions" :key="index" :label="item.label"
                     :value="item.value" :disabled="item.disabled" @keyup.enter.native="handleQuery"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="抓取时间" prop="searchDate">
        <el-date-picker clearable
                        v-model="queryParams.searchDate"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择抓取时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['system:book:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['system:book:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:book:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['system:book:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="bookList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="主键" align="center" width="200" prop="id"/>
      <el-table-column label="isbn" align="center" prop="isbn"/>
      <el-table-column label="书名" align="center" prop="bookName"/>
      <el-table-column label="作者" align="center" prop="author"/>
      <el-table-column label="出版社" align="center" prop="publisher"/>
      <el-table-column label="出版日期" align="center" prop="publishDate"/>
      <el-table-column label="评分人数" align="center" prop="scoreNum"/>
      <el-table-column label="评分" align="center" prop="score"/>
      <el-table-column label="是否抓取" align="center" prop="isSearch"/>
      <el-table-column label="分类" align="center" prop="category"/>
      <el-table-column label="原创译著" align="center" prop="originalTranslation"/>
      <el-table-column label="抓取时间" align="center" prop="searchDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.searchDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评分人数" align="center" prop="scorePeopleNum"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:book:edit']">
            修改
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['system:book:remove']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改豆瓣图书对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="bookRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="序号" prop="number">
          <el-input v-model="form.number" placeholder="请输入序号"/>
        </el-form-item>
        <el-form-item label="isbn" prop="isbn">
          <el-input v-model="form.isbn" placeholder="请输入isbn"/>
        </el-form-item>
        <el-form-item label="书名" prop="bookName">
          <el-input v-model="form.bookName" placeholder="请输入书名"/>
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者"/>
        </el-form-item>
        <el-form-item label="作者国家" prop="authorCountry">
          <el-input v-model="form.authorCountry" placeholder="请输入作者国家"/>
        </el-form-item>
        <el-form-item label="出版社" prop="publisher">
          <el-input v-model="form.publisher" placeholder="请输入出版社"/>
        </el-form-item>
        <el-form-item label="出版日期" prop="publishDate">
          <el-input v-model="form.publishDate" placeholder="请输入出版日期"/>
        </el-form-item>
        <el-form-item label="评分人数" prop="scoreNum">
          <el-input v-model="form.scoreNum" placeholder="请输入评分人数"/>
        </el-form-item>
        <el-form-item label="评分" prop="score">
          <el-input v-model="form.score" placeholder="请输入评分"/>
        </el-form-item>
        <el-form-item label="图书链接" prop="url">
          <el-input v-model="form.url" placeholder="请输入图书链接"/>
        </el-form-item>
        <el-form-item label="是否删除0-未删除,1-已删除" prop="isDelete">
          <el-input v-model="form.isDelete" placeholder="请输入是否删除0-未删除,1-已删除"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注"/>
        </el-form-item>
        <el-form-item label="是否抓取0-未抓取,1-已抓取" prop="isSearch">
          <el-input v-model="form.isSearch" placeholder="请输入是否抓取0-未抓取,1-已抓取"/>
        </el-form-item>
        <el-form-item label="创建时间" prop="createdTime">
          <el-date-picker clearable
                          v-model="form.createdTime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择创建时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="修改时间" prop="modifiedTime">
          <el-date-picker clearable
                          v-model="form.modifiedTime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择修改时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="序号isbn" prop="isbnNumber">
          <el-input v-model="form.isbnNumber" placeholder="请输入序号isbn"/>
        </el-form-item>
        <el-form-item label="届次" prop="theTime">
          <el-input v-model="form.theTime" placeholder="请输入届次"/>
        </el-form-item>
        <el-form-item label="颁奖年份" prop="awardYear">
          <el-input v-model="form.awardYear" placeholder="请输入颁奖年份"/>
        </el-form-item>
        <el-form-item label="分类 社科/科普/少儿" prop="category">
          <el-input v-model="form.category" placeholder="请输入分类 社科/科普/少儿"/>
        </el-form-item>
        <el-form-item label="原创译著" prop="originalTranslation">
          <el-input v-model="form.originalTranslation" placeholder="请输入原创译著"/>
        </el-form-item>
        <el-form-item label="星级" prop="starLevel">
          <el-input v-model="form.starLevel" placeholder="请输入星级"/>
        </el-form-item>
        <el-form-item label="sheet名称" prop="sheetName">
          <el-input v-model="form.sheetName" placeholder="请输入sheet名称"/>
        </el-form-item>
        <el-form-item label="抓取时间" prop="searchDate">
          <el-date-picker clearable
                          v-model="form.searchDate"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择抓取时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="评分人数" prop="scorePeopleNum">
          <el-input v-model="form.scorePeopleNum" placeholder="请输入评分人数"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Book">
import {listBook, getBook, delBook, addBook, updateBook} from "@/api/system/book";

const {proxy} = getCurrentInstance();

const bookList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const categoryOptions = [{
  label: '社科',
  value: '社科'
}, {
  label: '科普',
  value: '科普'
}, {
  label: '少儿',
  value: '少儿'
}]

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    number: null,
    isbn: null,
    bookName: null,
    author: null,
    authorCountry: null,
    publisher: null,
    publishDate: null,
    scoreNum: null,
    score: null,
    url: null,
    isDelete: null,
    isSearch: null,
    createdTime: null,
    modifiedTime: null,
    isbnNumber: null,
    theTime: null,
    awardYear: null,
    category: null,
    originalTranslation: null,
    awardStatus: null,
    starLevel: null,
    sheetName: null,
    searchDate: null,
    scorePeopleNum: null
  },
  rules: {
    isDelete: [
      {required: true, message: "是否删除0-未删除,1-已删除不能为空", trigger: "blur"}
    ],
    isSearch: [
      {required: true, message: "是否抓取0-未抓取,1-已抓取不能为空", trigger: "blur"}
    ],
    createdTime: [
      {required: true, message: "创建时间不能为空", trigger: "blur"}
    ],
    modifiedTime: [
      {required: true, message: "修改时间不能为空", trigger: "blur"}
    ],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询豆瓣图书列表 */
function getList() {
  loading.value = true;
  listBook(queryParams.value).then(response => {
    bookList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    number: null,
    isbn: null,
    bookName: null,
    author: null,
    authorCountry: null,
    publisher: null,
    publishDate: null,
    scoreNum: null,
    score: null,
    url: null,
    isDelete: null,
    remark: null,
    isSearch: null,
    createdTime: null,
    modifiedTime: null,
    isbnNumber: null,
    theTime: null,
    awardYear: null,
    category: null,
    originalTranslation: null,
    awardStatus: null,
    starLevel: null,
    sheetName: null,
    searchDate: null,
    scorePeopleNum: null
  };
  proxy.resetForm("bookRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加豆瓣图书";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getBook(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改豆瓣图书";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["bookRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateBook(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addBook(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除豆瓣图书编号为"' + _ids + '"的数据项？').then(function () {
    return delBook(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/book/export', {
    ...queryParams.value
  }, `book_${new Date().getTime()}.xlsx`)
}

getList();
</script>
