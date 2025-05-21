"use client"

import { useState, useEffect, useRef } from "react"
import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  Divider,
  Button,
  TextInput,
  Textarea,
  Select,
  SelectItem,
} from "@tremor/react"
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  PhotoIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline"
import { toast } from "react-hot-toast"

interface Devotional {
  _id: string
  date: string
  title: string
  commentary: string
  imageUrl: string
  further_study: string
  prayer: string
  devotional: string
  word_of_day: string
  scripture_of_day: string
  question_of_day: string[]
  announcements: string
  bible_in_one_year: string
  isbookMarked: string[]
  posted_by: string
  status: string
  isSuspended: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  status: boolean
  data: Devotional[]
  currentPage: number
  totalPages: number
  totalItems: number
}

export default function Devotionals() {
  // State management
  const [devotionals, setDevotionals] = useState<Devotional[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [currentDevotional, setCurrentDevotional] = useState<Devotional | null>(
    null,
  )
  const [selectedDevotionalType, setSelectedDevotionalType] = useState<
    string | null
  >(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [jumpToPage, setJumpToPage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const limit = 10 // Adjusted to match API response (2 items per page)

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    commentary: "",
    imageUrl: "",
    further_study: "",
    prayer: "",
    word_of_day: "",
    scripture_of_day: "",
    bible_in_one_year: "",
    question_of_day: [] as string[],
    devotional: "dailyguide",
  })

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch devotionals with pagination and filters
  useEffect(() => {
    const fetchDevotionals = async () => {
      setIsLoading(true)
      try {
        let url = `https://staging-fcsdevotional.onrender.com/api/v1/devotionals/${
          selectedDevotionalType || "dailyguide"
        }?page=${page}&limit=${limit}`

        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`
        }

        const response = await fetch(url)
        const result: ApiResponse = await response.json()
        if (result.status) {
          setDevotionals(result.data)
          setTotalPages(result.totalPages)
          setTotalItems(result.totalItems)
        } else {
          throw new Error("API response status is false")
        }
      } catch (error) {
        console.error("Error fetching devotionals:", error)
        toast.error("Failed to load devotionals")
      } finally {
        setIsLoading(false)
      }
    }
    fetchDevotionals()
  }, [page, selectedDevotionalType, searchQuery])

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle image upload
  const uploadImage = async () => {
    if (!selectedImage) return null

    setIsUploading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const fakeUploadedUrl = URL.createObjectURL(selectedImage)
      setIsUploading(false)
      return fakeUploadedUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
      setIsUploading(false)
      return null
    }
  }

  // Handle modal open for adding new devotional
  const openAddModal = () => {
    setModalMode("add")
    setFormData({
      title: "",
      commentary: "",
      imageUrl: "",
      further_study: "",
      prayer: "",
      word_of_day: "",
      scripture_of_day: "",
      bible_in_one_year: "",
      question_of_day: [],
      devotional: "dailyguide",
    })
    setSelectedImage(null)
    setImagePreview(null)
    setIsModalOpen(true)
  }

  // Handle submit for adding/editing devotional
  const handleSubmit = async () => {
    try {
      let imageUrl = formData.imageUrl
      if (selectedImage) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      const submitData = {
        ...formData,
        imageUrl,
        status: "pending",
      }

      if (modalMode === "add") {
        await addDevotional(submitData)
      } else {
        await updateDevotional(submitData)
      }

      setIsModalOpen(false)
      refreshData()
    } catch (error) {
      console.error(
        `Error ${modalMode === "add" ? "adding" : "updating"} devotional:`,
        error,
      )
      toast.error(
        `Failed to ${modalMode === "add" ? "add" : "update"} devotional`,
      )
    }
  }

  // Add new devotional
  const addDevotional = async (data: any) => {
    const response = await fetch(
      `https://staging-fcsdevotional.onrender.com/api/v1/devotionals/${data.devotional}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    )

    if (response.ok) {
      toast.success("Devotional added successfully")
    } else {
      throw new Error("Failed to add devotional")
    }
  }

  // Handle edit devotional
  const handleEdit = (devotional: Devotional) => {
    setCurrentDevotional(devotional)
    setFormData({
      title: devotional.title,
      commentary: devotional.commentary,
      imageUrl: devotional.imageUrl,
      further_study: devotional.further_study,
      prayer: devotional.prayer,
      word_of_day: devotional.word_of_day,
      scripture_of_day: devotional.scripture_of_day,
      bible_in_one_year: devotional.bible_in_one_year,
      question_of_day: devotional.question_of_day || [],
      devotional: devotional.devotional,
    })
    setImagePreview(devotional.imageUrl)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  // Update devotional
  const updateDevotional = async (data: any) => {
    if (!currentDevotional) return

    const response = await fetch(
      `https://staging-fcsdevotional.onrender.com/api/v1/devotionals/${data.devotional}/${currentDevotional._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    )

    if (response.ok) {
      toast.success("Devotional updated successfully")
      setCurrentDevotional(null)
    } else {
      throw new Error("Failed to update devotional")
    }
  }

  // Handle delete devotional
  const handleDelete = async (id: string, devotionalType: string) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this devotional?",
      )
      if (!confirmed) return

      const response = await fetch(
        `https://staging-fcsdevotional.onrender.com/api/v1/devotionals/${devotionalType}/${id}`,
        { method: "DELETE" },
      )

      if (response.ok) {
        toast.success("Devotional deleted successfully")
        refreshData()
      } else {
        throw new Error("Failed to delete devotional")
      }
    } catch (error) {
      console.error("Error deleting devotional:", error)
      toast.error("Failed to delete devotional")
    }
  }

  // Refresh data
  const refreshData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://staging-fcsdevotional.onrender.com/api/v1/devotionals/dailyguide?page=${page}&limit=${limit}&devotional=${selectedDevotionalType || "dailyguide"}`,
      )
      const result: ApiResponse = await response.json()
      if (result.status) {
        setDevotionals(result.data)
        setTotalPages(result.totalPages)
        setTotalItems(result.totalItems)
      } else {
        throw new Error("API response status is false")
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle page jump
  const handlePageJump = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNum = parseInt(jumpToPage)
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum)
    } else {
      toast.error(`Please enter a page number between 1 and ${totalPages}`)
    }
    setJumpToPage("")
  }

  // Add question to question of the day
  const [newQuestion, setNewQuestion] = useState("")

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setFormData({
        ...formData,
        question_of_day: [...formData.question_of_day, newQuestion.trim()],
      })
      setNewQuestion("")
    }
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...formData.question_of_day]
    updatedQuestions.splice(index, 1)
    setFormData({
      ...formData,
      question_of_day: updatedQuestions,
    })
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <Card className="rounded-xl shadow-md">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Title>Devotionals Dashboard</Title>
            <Text className="mt-1 text-gray-500">
              Manage and organize daily devotional content ({totalItems} total)
            </Text>
          </div>
          <Button
            icon={PlusIcon}
            onClick={openAddModal}
            color="blue"
            size="sm"
            className="self-start rounded-full"
          >
            Add Devotional
          </Button>
        </div>

        <TabGroup
          onIndexChange={(index) => {
            setSelectedDevotionalType(
              index === 0 ? null : index === 1 ? "dailypower" : "dailymilk",
            )
            setPage(1)
          }}
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabList variant="solid" className="w-full rounded-full sm:w-auto">
              <Tab className="rounded-l-full">Daily Guide</Tab>
              <Tab>Daily Power</Tab>
              <Tab className="rounded-r-full">Daily Milk</Tab>
            </TabList>

            <div className="flex max-w-md flex-1 gap-2">
              <TextInput
                placeholder="Search by title or scripture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md rounded-full"
              />
              <Button
                variant="secondary"
                color="gray"
                icon={ArrowPathIcon}
                onClick={refreshData}
                tooltip="Refresh data"
                className="shrink-0 rounded-full"
              />
            </div>
          </div>

          <TabPanels>
            <TabPanel>
              <DevotionalsList
                devotionals={devotionals}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                isLoading={isLoading}
                formatDate={formatDate}
              />
            </TabPanel>
            <TabPanel>
              <DevotionalsList
                devotionals={devotionals.filter(
                  (d) => d.devotional === "dailypower",
                )}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                isLoading={isLoading}
                formatDate={formatDate}
              />
            </TabPanel>
            <TabPanel>
              <DevotionalsList
                devotionals={devotionals.filter(
                  (d) => d.devotional === "dailymilk",
                )}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                isLoading={isLoading}
                formatDate={formatDate}
              />
            </TabPanel>
          </TabPanels>
        </TabGroup>

        {/* Enhanced Pagination */}
        <Divider />
        <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Text className="text-sm text-gray-500">
              Page {page} of {totalPages} ({totalItems} items)
            </Text>
          </div>

          <div className="flex items-center gap-2">
            <form onSubmit={handlePageJump} className="flex items-center gap-2">
              <TextInput
                placeholder="Go to page"
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                className="w-24 rounded-full"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="rounded-full"
              >
                Go
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-2">
            <Button
              icon={ChevronLeftIcon}
              variant="secondary"
              color="gray"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-full px-2"
              tooltip="Previous page"
            />

            <div className="hidden gap-1 sm:flex">
              {(() => {
                const pagesToShow = 5
                let startPage = Math.max(1, page - Math.floor(pagesToShow / 2))
                const endPage = Math.min(
                  totalPages,
                  startPage + pagesToShow - 1,
                )
                if (endPage - startPage + 1 < pagesToShow) {
                  startPage = Math.max(1, endPage - pagesToShow + 1)
                }

                return Array.from(
                  { length: endPage - startPage + 1 },
                  (_, i) => {
                    const pageNum = startPage + i
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "primary" : "secondary"}
                        color={page === pageNum ? "blue" : "gray"}
                        onClick={() => setPage(pageNum)}
                        size="sm"
                        className="h-9 w-9 rounded-full p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  },
                )
              })()}
            </div>

            <Button
              icon={ChevronRightIcon}
              variant="secondary"
              color="gray"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-full px-2"
              tooltip="Next page"
            />
          </div>
        </div>
      </Card>

      {/* Enhanced Modal for Add/Edit Devotional */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-md">
          <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <Title className="text-2xl font-semibold">
                {modalMode === "add"
                  ? "Create New Devotional"
                  : "Edit Devotional"}
              </Title>
              <Button
                icon={XMarkIcon}
                variant="light"
                color="gray"
                onClick={() => setIsModalOpen(false)}
                tooltip="Close"
                className="rounded-full hover:bg-gray-100"
              />
            </div>

            <div className="p-6">
              <TabGroup>
                <TabList className="rounded-full bg-gray-100 p-1">
                  <Tab className="rounded-full">Basic Info</Tab>
                  <Tab className="rounded-full">Content Details</Tab>
                  <Tab className="rounded-full">Questions</Tab>
                </TabList>

                <TabPanels>
                  {/* Basic Info Panel */}
                  <TabPanel>
                    <div className="mt-6 space-y-6">
                      <div>
                        <Text className="font-medium text-gray-700">
                          Devotional Type
                        </Text>
                        <Select
                          name="devotional"
                          value={formData.devotional}
                          onChange={(value) =>
                            setFormData({ ...formData, devotional: value })
                          }
                          className="mt-1 rounded-full"
                        >
                          <SelectItem value="dailyguide">
                            Daily Guide
                          </SelectItem>
                          <SelectItem value="dailypower">
                            Daily Power
                          </SelectItem>
                          <SelectItem value="dailymilk">Daily Milk</SelectItem>
                        </Select>
                      </div>

                      <div>
                        <Text className="font-medium text-gray-700">Title</Text>
                        <TextInput
                          name="title"
                          placeholder="Enter devotional title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="mt-1 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <Text className="font-medium text-gray-700">
                          Scripture of the Day
                        </Text>
                        <TextInput
                          name="scripture_of_day"
                          placeholder="Enter scripture reference (e.g., John 3:16)"
                          value={formData.scripture_of_day}
                          onChange={handleInputChange}
                          className="mt-1 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <Text className="font-medium text-gray-700">
                            Word of the Day
                          </Text>
                          <TextInput
                            name="word_of_day"
                            placeholder="Enter word of the day"
                            value={formData.word_of_day}
                            onChange={handleInputChange}
                            className="mt-1 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <Text className="font-medium text-gray-700">
                            Bible in One Year
                          </Text>
                          <TextInput
                            name="bible_in_one_year"
                            placeholder="Enter Bible reading plan"
                            value={formData.bible_in_one_year}
                            onChange={handleInputChange}
                            className="mt-1 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <Text className="font-medium text-gray-700">
                          Featured Image
                        </Text>
                        <div className="mt-2 flex flex-col gap-4">
                          <div
                            className="relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition-colors duration-200 hover:bg-gray-50"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="h-full w-full rounded-lg object-cover"
                              />
                            ) : (
                              <>
                                <PhotoIcon className="h-12 w-12 text-gray-400" />
                                <Text className="mt-2 text-gray-500">
                                  Click to upload image
                                </Text>
                                <Text className="text-xs text-gray-400">
                                  Supported formats: JPG, PNG
                                </Text>
                              </>
                            )}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                            />
                          </div>

                          {!selectedImage && (
                            <div>
                              <Text className="font-medium text-gray-700">
                                Or enter image URL
                              </Text>
                              <TextInput
                                name="imageUrl"
                                placeholder="https://example.com/image.jpg"
                                value={formData.imageUrl}
                                onChange={handleInputChange}
                                className="mt-1 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabPanel>

                  {/* Content Details Panel */}
                  <TabPanel>
                    <div className="mt-6 space-y-6">
                      <div>
                        <Text className="font-medium text-gray-700">
                          Commentary
                        </Text>
                        <Textarea
                          name="commentary"
                          placeholder="Enter devotional commentary"
                          value={formData.commentary}
                          onChange={handleInputChange}
                          rows={6}
                          className="mt-1 rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <Text className="font-medium text-gray-700">
                          Further Study
                        </Text>
                        <Textarea
                          name="further_study"
                          placeholder="Enter further study references"
                          value={formData.further_study}
                          onChange={handleInputChange}
                          rows={3}
                          className="mt-1 rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <Text className="font-medium text-gray-700">
                          Prayer
                        </Text>
                        <Textarea
                          name="prayer"
                          placeholder="Enter prayer text"
                          value={formData.prayer}
                          onChange={handleInputChange}
                          rows={3}
                          className="mt-1 rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </TabPanel>

                  {/* Additional Fields Panel */}
                  <TabPanel>
                    <div className="mt-6 space-y-6">
                      <div>
                        <Text className="font-medium text-gray-700">
                          Questions of the Day
                        </Text>
                        <div className="mt-2 flex gap-3">
                          <TextInput
                            placeholder="Add a question"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            className="flex-1 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500"
                          />
                          <Button
                            variant="secondary"
                            color="blue"
                            onClick={addQuestion}
                            className="rounded-full px-6"
                          >
                            Add
                          </Button>
                        </div>

                        <div className="mt-4 space-y-3">
                          {formData.question_of_day.map((q, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                            >
                              <Text className="flex-1 text-gray-700">{q}</Text>
                              <Button
                                icon={XMarkIcon}
                                variant="light"
                                color="red"
                                onClick={() => removeQuestion(idx)}
                                tooltip="Remove question"
                                size="xs"
                                className="rounded-full hover:bg-red-100"
                              />
                            </div>
                          ))}
                          {formData.question_of_day.length === 0 && (
                            <Text className="italic text-gray-500">
                              No questions added yet
                            </Text>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </div>

            <Divider className="my-6" />

            <div className="flex justify-end gap-3 p-6">
              <Button
                variant="secondary"
                color="gray"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full px-6"
              >
                Cancel
              </Button>
              <Button
                loading={isUploading}
                onClick={handleSubmit}
                color="blue"
                className="rounded-full px-6"
              >
                {modalMode === "add"
                  ? "Create Devotional"
                  : "Update Devotional"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// DevotionalsList component
interface DevotionalsListProps {
  devotionals: Devotional[]
  handleEdit: (devotional: Devotional) => void
  handleDelete: (id: string, devotionalType: string) => void
  isLoading: boolean
  formatDate: (date: string) => string
}

function DevotionalsList({
  devotionals,
  handleEdit,
  handleDelete,
  isLoading,
  formatDate,
}: DevotionalsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (devotionals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <DocumentTextIcon className="mb-4 h-16 w-16 text-gray-300" />
        <Text className="text-lg text-gray-500">No devotionals found</Text>
        <Text className="mt-1 text-gray-400">
          Try adjusting your filters or adding a new devotional
        </Text>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {devotionals.map((devotional) => (
        <Card
          key={devotional._id}
          className="overflow-hidden rounded-xl transition-shadow hover:shadow-md"
        >
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Image */}
            <div className="h-40 w-full overflow-hidden rounded-xl bg-gray-100 md:w-1/3">
              {devotional.imageUrl ? (
                <img
                  src={devotional.imageUrl}
                  alt={devotional.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/150?text=No+Image"
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <PhotoIcon className="h-12 w-12 text-gray-300" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <Title className="truncate text-lg">{devotional.title}</Title>
                  <Text className="text-xs text-gray-500">
                    {formatDate(devotional.date)}
                  </Text>
                  <Text className="text-xs capitalize text-blue-600">
                    {devotional.devotional.replace("daily", "Daily ")}
                  </Text>
                </div>
              </div>

              <Text className="mb-2 line-clamp-2 text-sm text-gray-600">
                {devotional.scripture_of_day}
              </Text>

              <div className="mt-4 flex items-center justify-between">
                <Text className="truncate text-xs text-gray-500">
                  Bible in one year: {devotional.bible_in_one_year}
                </Text>

                <div className="flex space-x-2">
                  <Button
                    icon={PencilIcon}
                    variant="light"
                    color="blue"
                    onClick={() => handleEdit(devotional)}
                    tooltip="Edit"
                    size="xs"
                    className="rounded-full"
                  />
                  <Button
                    icon={TrashIcon}
                    variant="light"
                    color="red"
                    onClick={() =>
                      handleDelete(devotional._id, devotional.devotional)
                    }
                    tooltip="Delete"
                    size="xs"
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
