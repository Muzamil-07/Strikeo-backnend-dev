const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const SubSubCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  parentSubCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory'
  }
}, { timestamps: true });

SubSubCategorySchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    parentCategory: this.parentCategory,
    parentSubCategory: this.parentSubCategory,
  }
}

const SubSubCategory= mongoose.model('SubSubCategory', SubSubCategorySchema)

const SubCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    subSubCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubSubCategory'
      }
    ],
  },
  { timestamps: true }
)

SubCategorySchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    subSubCategories: this.subSubCategories,
  }
}

const SubCategory = mongoose.model('SubCategory', SubCategorySchema)


const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    subCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

CategorySchema.plugin(uniqueValidator, { message: 'is already taken.' })
CategorySchema.plugin(mongoosePaginate)

CategorySchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    subCategories: this.subCategories,
    isActive: this.isActive
  }
}

const Category = mongoose.model('Category', CategorySchema)

module.exports = {
  Category,
  SubCategory,
  SubSubCategory
}
