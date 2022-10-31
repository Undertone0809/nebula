<template>
  <el-row style="margin-top: 20px;">
    <el-col style="margin-bottom: 1rem;">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>文章管理</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col>
      <el-table
        :data="articles.list"
        style="width: 100%">
        <el-table-column
          type="index"
          width="60"
          prop="idArticle">
        </el-table-column>
        <!-- <el-table-column
          label="id"
          width="60"
          prop="idArticle">
        </el-table-column> -->
        <el-table-column
          label="标题"
          prop="articleTitle">
          <template slot-scope="scope">
            <el-button type="text" @click="openLink(scope.row.articlePermalink)">{{ scope.row.articleTitle }}</el-button>
            <el-tag
              style="margin-left: 0.3rem;"
              v-if="scope.row.articleStatus == 1"
              size="mini"
              type="danger"
              effect="plain">
              未审核
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="标签"
          width="120"
          prop="articleTitle">
          <template slot-scope="scope">
            <el-tag
              style="margin-left: 0.3rem;"
              v-for="tag in scope.row.tags"
              :key="tag.idTag"
              size="mini"
              effect="plain">
              # {{ tag.tagTitle }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="作者"
          width="100">
          <template slot-scope="scope">
            <el-button type="text" @click="openLink('/user/' + scope.row.articleAuthor.userAccount)">{{ scope.row.articleAuthorName }}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="最后更新时间"
          width="110"
          prop="updatedTime">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button v-if="scope.row.articlePerfect === '1'" size="mini" @click="cancelPreference(scope.$index, scope.row.idArticle)" plain>取消优选</el-button>
            <el-button v-else size="mini" @click="setPreference(scope.$index, scope.row.idArticle)" plain>设为优选</el-button>
            <el-button size="mini" type="primary"
                       @click="updateTags(scope.$index, scope.row)" plain>编辑标签
            </el-button>
            <el-button v-if="scope.row.articleStatus === '0'" size="mini" type="danger"
                       @click="toggleStatus(scope.$index, scope.row)" plain>下架
            </el-button>
            <el-button v-else size="mini" type="success"
                       @click="toggleStatus(scope.$index, scope.row)" plain>审核通过
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
    <el-col>
      <el-pagination
        :hide-on-single-page="true"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="articles.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="articles.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="articles.total">
      </el-pagination>
    </el-col>
    <el-col>
      <el-dialog :visible.sync="dialogVisible">
        <edit-tags
          :idArticle="idArticle"
          :tags="articleTags"
          @closeDialog="closeTagsDialog">
        </edit-tags>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script>
import {mapState} from 'vuex';
import EditTags from '~/components/widget/tags';

export default {
  name: "articles",
  components: {
    EditTags
  },
  fetch() {
    let {store, params, error} = this.$nuxt.context
    return Promise.all([
      store
        .dispatch('admin/fetchAllArticles', params)
        .catch(err => error({statusCode: 404}))
    ])
  },
  computed: {
    ...mapState({
      articles: state => state.admin.articles
    })
  },
  data() {
    return {
      order: 'desc',
      idRole: 0,
      idUser: 0,
      dialogVisible: false,
      index: Number,
      idArticle: Number,
      articleTags: ''
    }
  },
  methods: {
    handleSizeChange(pageSize) {
      let _ts = this;
      _ts.$store.dispatch('admin/fetchAllArticles', {
        page: _ts.articles.pageNum,
        rows: pageSize
      })
    },
    handleCurrentChange(page) {
      let _ts = this;
      _ts.$store.dispatch('admin/fetchAllArticles', {
        page: page,
        rows: _ts.articles.pageSize
      })
    },
    // TODO  temporary modify
    toggleStatus(index, article) {     
      let _ts = this
      
      // normal
      if (article.articleStatus == 0) {
        _ts.$axios.$patch("/api/admin/article/update-status", {
          idArticle: article.idArticle,
          articleStatus: '1'
        }).then(res => {         
          _ts.$store.commit('admin/updateArticleStatus', {
            index: index,
            idArticle: article.idArticle,
            articleStatus: '1'
          })   
        })
        _ts.$message.success("已下架");
      } 
      
      // unnormal
      if (article.articleStatus == 1) {     
        _ts.$axios.$patch('/api/admin/article/update-status', {
          idArticle: article.idArticle,
          articleStatus: '0'
        }).then(res => {
          _ts.$store.commit('admin/updateArticleStatus', {
            index: index,
            idArticle: article.idArticle,
            articleStatus: '0'
          })
        })
        _ts.$message.success("审核上线");
      }
    },
    setPreference(index, idArticle) {
      let _ts = this;
      _ts.$axios.$patch("/api/admin/article/update-perfect", {
        idArticle: idArticle,
        articlePerfect: '1'
        // TODO
      }).then(res => {        
        _ts.$store.commit('admin/updateArticlePreference', {
          index: index,
          idArticle: idArticle,
          articlePerfect: '1'
        })
        _ts.$message.success("设置成功!");
      })
    },
    cancelPreference(index, idArticle) {
      let _ts = this;
      _ts.$axios.$patch("/api/admin/article/update-perfect", {
        idArticle: idArticle,
        articlePerfect: '0'
      }).then(res => {
        _ts.$store.commit('admin/updateArticlePreference', {
          index: index,
          idArticle: idArticle,
          articlePerfect: '0'
        })
        _ts.$message.success("取消成功!");
             
      })
    },
    updateTags(index, article) {
      // console.log(index)
      // console.log(JSON.stringify(article))
      // TODO data can not update
      let _ts = this
      _ts.$set(_ts, 'index', index);
      _ts.$set(_ts, 'idArticle', article.idArticle);
      _ts.$set(_ts, 'articleTags', article.articleTags);
      _ts.$set(_ts, 'dialogVisible', true);
    },
    closeTagsDialog() {
      this.$set(this, 'dialogVisible', false);
    },
    openLink(link) {
      window.open(link);
    }
  },
  mounted() {
    this.$store.commit("setActiveMenu", "admin-articles");
  }
}
</script>

<style scoped>

</style>
