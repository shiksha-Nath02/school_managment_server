'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('marks');

    await queryInterface.createTable('marks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'classes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      subject: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      exam_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'class_test, ut1, ut2, ut3, ut4, midterm, final'
      },
      max_marks: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      marks_obtained: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'NULL if student was absent'
      },
      is_absent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      remark: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Teacher remark for this student on this exam'
      },
      uploaded_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Teacher ID (from teachers table) who uploaded'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('marks', ['student_id', 'subject', 'exam_type'], {
      unique: true,
      name: 'unique_student_subject_exam'
    });

    await queryInterface.addIndex('marks', ['class_id', 'exam_type', 'subject'], {
      name: 'idx_class_exam_subject'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('marks');

    await queryInterface.createTable('marks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      student_id: {
        type: Sequelize.INTEGER,
        references: { model: 'students', key: 'id' }
      },
      class_id: {
        type: Sequelize.INTEGER,
        references: { model: 'classes', key: 'id' }
      },
      subject: Sequelize.STRING,
      exam_type: Sequelize.STRING,
      marks_obtained: Sequelize.FLOAT,
      max_marks: Sequelize.FLOAT,
      uploaded_by: {
        type: Sequelize.INTEGER,
        references: { model: 'teachers', key: 'id' }
      }
    });
  }
};
