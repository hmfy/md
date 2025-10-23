<script setup lang="ts">
import { Info, Upload } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useStore } from '@/stores'
import { processClipboardContent } from '@/utils'

const store = useStore()
const { output, primaryColor } = storeToRefs(store)

const dialogVisible = ref(false)
const publishing = ref(false)
const publishStep = ref<`` | `token` | `upload` | `draft` | `success` | `error`>(``)
const publishMessage = ref(``)

const form = ref({
  appId: ``,
  appSecret: ``,
  title: ``,
  desc: ``,
  author: ``,
  thumbFile: null as File | null,
  thumbPreview: ``,
  content: ``,
})

const allowPublish = computed(() => {
  return form.value.appId.trim()
    && form.value.appSecret.trim()
    && form.value.title.trim()
    && form.value.thumbFile !== null
    && form.value.content.trim()
    && !publishing.value
})

// 文件上传处理
const fileInputRef = ref<HTMLInputElement | null>(null)

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return

  // 验证文件类型
  if (!file.type.startsWith(`image/`)) {
    toast.error(`请选择图片文件`)
    return
  }

  // 验证文件大小（图片限制 10MB）
  if (file.size > 10 * 1024 * 1024) {
    toast.error(`图片大小不能超过 10MB`)
    return
  }

  form.value.thumbFile = file

  // 生成预览
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.thumbPreview = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function triggerFileUpload() {
  fileInputRef.value?.click()
}

function removeThumb() {
  form.value.thumbFile = null
  form.value.thumbPreview = ``
  if (fileInputRef.value) {
    fileInputRef.value.value = ``
  }
}

async function prePost() {
  try {
    // 自动提取内容
    form.value.title = [1, 2, 3, 4, 5, 6]
      .map(h => document.querySelector(`#output h${h}`)!)
      .find(h => h)
      ?.textContent
      ?.trim() ?? ``

    form.value.desc = document.querySelector(`#output p`)?.textContent?.trim() ?? ``

    // 处理内容样式（与复制功能保持一致）
    await processClipboardContent(primaryColor.value)
    const clipboardDiv = document.getElementById(`output`)!
    form.value.content = clipboardDiv.innerHTML

    // 恢复原始内容
    clipboardDiv.innerHTML = output.value
  }
  catch (error) {
    console.log(`error`, error)
  }
}

// 获取 access_token
async function getAccessToken(appId: string, appSecret: string): Promise<string> {
  publishStep.value = `token`
  publishMessage.value = `正在获取 access_token...`

  const response = await fetch(`/wechat/cgi-bin/stable_token`, {
    method: `POST`,
    headers: {
      'Content-Type': `application/json`,
    },
    body: JSON.stringify({
      grant_type: `client_credential`,
      appid: appId,
      secret: appSecret,
      force_refresh: false,
    }),
  })

  const data = await response.json()

  if (data.errcode && data.errcode !== 0) {
    throw new Error(data.errmsg || `获取 access_token 失败`)
  }

  return data.access_token
}

// 上传图片素材
async function uploadMaterial(accessToken: string, file: File): Promise<string> {
  publishStep.value = `upload`
  publishMessage.value = `正在上传封面图片...`

  const formData = new FormData()
  formData.append(`media`, file)

  const response = await fetch(
    `/wechat/cgi-bin/material/add_material?access_token=${accessToken}&type=image`,
    {
      method: `POST`,
      body: formData,
    },
  )

  const data = await response.json()

  if (data.errcode && data.errcode !== 0) {
    throw new Error(data.errmsg || `上传素材失败`)
  }

  return data.media_id
}

// 新增草稿
async function addDraft(accessToken: string, thumbMediaId: string): Promise<string> {
  publishStep.value = `draft`
  publishMessage.value = `正在创建草稿...`

  const response = await fetch(
    `/wechat/cgi-bin/draft/add?access_token=${accessToken}`,
    {
      method: `POST`,
      headers: {
        'Content-Type': `application/json`,
      },
      body: JSON.stringify({
        articles: [
          {
            title: form.value.title,
            author: form.value.author || ``,
            digest: form.value.desc || ``,
            content: form.value.content,
            thumb_media_id: thumbMediaId,
            need_open_comment: 0,
            only_fans_can_comment: 0,
          },
        ],
      }),
    },
  )

  const data = await response.json()

  if (data.errcode && data.errcode !== 0) {
    throw new Error(data.errmsg || `创建草稿失败`)
  }

  return data.media_id
}

// 发布到草稿
async function publishToDraft() {
  if (!allowPublish.value)
    return

  publishing.value = true
  publishStep.value = ``
  publishMessage.value = ``

  try {
    // 1. 获取 access_token
    const accessToken = await getAccessToken(form.value.appId, form.value.appSecret)

    // 2. 上传封面图片
    const thumbMediaId = await uploadMaterial(accessToken, form.value.thumbFile!)

    // 3. 新增草稿
    const mediaId = await addDraft(accessToken, thumbMediaId)

    publishStep.value = `success`
    publishMessage.value = `草稿创建成功！media_id: ${mediaId}`
    toast.success(`草稿发布成功`)
  }
  catch (error: any) {
    publishStep.value = `error`
    publishMessage.value = error.message || `发布失败`
    toast.error(publishMessage.value)
    console.error(`发布错误:`, error)
  }
  finally {
    publishing.value = false
  }
}

function onUpdate(val: boolean) {
  if (!val) {
    dialogVisible.value = false
    // 重置发布状态
    if (!publishing.value) {
      publishStep.value = ``
      publishMessage.value = ``
    }
  }
}
</script>

<template>
  <Dialog v-model:open="dialogVisible" @update:open="onUpdate">
    <DialogTrigger>
      <Button v-if="!store.isMobile" variant="outline" @click="prePost">
        发布到微信
      </Button>
    </DialogTrigger>
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>发布到微信公众号</DialogTitle>
      </DialogHeader>

      <Alert>
        <Info class="h-4 w-4" />
        <AlertTitle>提示</AlertTitle>
        <AlertDescription>
          请填写您的微信公众号 AppID 和 AppSecret，点击发布草稿后将自动调用微信接口创建草稿。
        </AlertDescription>
      </Alert>

      <!-- 发布状态提示 -->
      <Alert v-if="publishStep" :variant="publishStep === 'error' ? 'destructive' : 'default'">
        <Info class="h-4 w-4" />
        <AlertTitle>{{ publishStep === 'success' ? '成功' : publishStep === 'error' ? '错误' : '处理中' }}</AlertTitle>
        <AlertDescription>
          {{ publishMessage }}
        </AlertDescription>
      </Alert>

      <div class="space-y-4">
        <!-- AppID -->
        <div class="w-full flex items-center gap-4">
          <Label for="appId" class="w-24 text-end shrink-0">
            AppID
          </Label>
          <Input
            id="appId"
            v-model="form.appId"
            placeholder="请输入公众号 AppID"
            :disabled="publishing"
          />
        </div>

        <!-- AppSecret -->
        <div class="w-full flex items-center gap-4">
          <Label for="appSecret" class="w-24 text-end shrink-0">
            AppSecret
          </Label>
          <Input
            id="appSecret"
            v-model="form.appSecret"
            type="password"
            placeholder="请输入公众号 AppSecret"
            :disabled="publishing"
          />
        </div>

        <Separator />

        <!-- 标题 -->
        <div class="w-full flex items-center gap-4">
          <Label for="title" class="w-24 text-end shrink-0">
            标题
          </Label>
          <Input
            id="title"
            v-model="form.title"
            placeholder="自动提取第一个标题"
            :disabled="publishing"
          />
        </div>

        <!-- 作者 -->
        <div class="w-full flex items-center gap-4">
          <Label for="author" class="w-24 text-end shrink-0">
            作者
          </Label>
          <Input
            id="author"
            v-model="form.author"
            placeholder="可选"
            :disabled="publishing"
          />
        </div>

        <!-- 描述 -->
        <div class="w-full flex items-start gap-4">
          <Label for="desc" class="w-24 text-end shrink-0 pt-2">
            摘要
          </Label>
          <Textarea
            id="desc"
            v-model="form.desc"
            placeholder="自动提取第一个段落"
            rows="3"
            :disabled="publishing"
          />
        </div>

        <!-- 封面上传 -->
        <div class="w-full flex items-start gap-4">
          <Label class="w-24 text-end shrink-0 pt-2">
            封面图片
          </Label>
          <div class="flex-1 space-y-2">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileSelect"
            >
            <div v-if="form.thumbPreview" class="relative inline-block">
              <img
                :src="form.thumbPreview"
                alt="封面预览"
                class="w-32 h-32 object-cover rounded border"
              >
              <Button
                variant="destructive"
                size="sm"
                class="absolute -top-2 -right-2"
                :disabled="publishing"
                @click="removeThumb"
              >
                删除
              </Button>
            </div>
            <Button
              v-else
              variant="outline"
              :disabled="publishing"
              @click="triggerFileUpload"
            >
              <Upload class="mr-2 h-4 w-4" />
              上传封面（≤10MB）
            </Button>
            <p class="text-xs text-muted-foreground">
              支持 bmp/png/jpeg/jpg/gif 格式，大小不超过 10MB
            </p>
          </div>
        </div>
      </div>

      <DialogFooter class="gap-2">
        <Button variant="outline" :disabled="publishing" @click="dialogVisible = false">
          取 消
        </Button>
        <Button :disabled="!allowPublish" @click="publishToDraft">
          {{ publishing ? '发布中...' : '发布草稿' }}
        </Button>
        <Button variant="secondary" disabled>
          发布到公众号（待实现）
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
