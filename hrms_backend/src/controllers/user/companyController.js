const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');

/**
 * Get all companies (super admin only)
 */
const getAllCompanies = async (req, res) => {
  try {
    // Check if user is super admin (you may need to implement proper role check)
    const userRole = req.user?.role;
    if (userRole !== 'super-admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Only super admins can access companies'
      });
    }

    // Get all companies
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            companyUsers: true,
            departments: true,
            designations: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data
    const transformedCompanies = companies.map(company => ({
      id: company.id.toString(),
      name: company.name,
      slug: company.slug,
      legalName: company.legalName,
      countryCode: company.countryCode,
      timezone: company.timezone,
      plan: company.plan,
      status: company.status,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      userCount: company._count.companyUsers,
      departmentCount: company._count.departments,
      designationCount: company._count.designations
    }));

    res.status(200).json({
      status: 'success',
      data: transformedCompanies
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch companies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get company by ID
 */
const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    
    // Check if user is super admin or belongs to this company
    const userCompanyId = req.user?.companyId;
    const userRole = req.user?.role;
    
    if (userRole !== 'super-admin' && userCompanyId !== companyId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: You can only access your own company'
      });
    }

    const company = await prisma.company.findUnique({
      where: {
        id: BigInt(companyId)
      },
      include: {
        _count: {
          select: {
            companyUsers: true,
            departments: true,
            designations: true,
            customFields: true,
            documentTypes: true,
            roles: true
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found'
      });
    }

    const transformedCompany = {
      id: company.id.toString(),
      name: company.name,
      slug: company.slug,
      legalName: company.legalName,
      countryCode: company.countryCode,
      timezone: company.timezone,
      plan: company.plan,
      status: company.status,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      userCount: company._count.companyUsers,
      departmentCount: company._count.departments,
      designationCount: company._count.designations,
      customFieldCount: company._count.customFields,
      documentTypeCount: company._count.documentTypes,
      roleCount: company._count.roles
    };

    res.status(200).json({
      status: 'success',
      data: transformedCompany
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch company',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new company (super admin only)
 */
const createCompany = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'super-admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Only super admins can create companies'
      });
    }

    const { name, slug, legalName, countryCode, timezone, plan, status } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and slug are required'
      });
    }

    // Check if slug already exists
    const existingCompany = await prisma.company.findUnique({
      where: { slug }
    });

    if (existingCompany) {
      return res.status(400).json({
        status: 'error',
        message: 'Company with this slug already exists'
      });
    }

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        legalName,
        countryCode,
        timezone: timezone || 'UTC',
        plan,
        status: status || 'active'
      }
    });

    // Audit log
    await auditFromRequest(req, {
      entity: 'company',
      entityId: company.id.toString(),
      action: 'CREATE',
      diff: { ...req.body }
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: company.id.toString(),
        name: company.name,
        slug: company.slug,
        legalName: company.legalName,
        countryCode: company.countryCode,
        timezone: company.timezone,
        plan: company.plan,
        status: company.status,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create company',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update company
 */
const updateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const userRole = req.user?.role;
    
    if (userRole !== 'super-admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Only super admins can update companies'
      });
    }

    const { name, slug, legalName, countryCode, timezone, plan, status } = req.body;

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: BigInt(companyId) }
    });

    if (!existingCompany) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found'
      });
    }

    // Check if new slug conflicts with another company
    if (slug && slug !== existingCompany.slug) {
      const slugConflict = await prisma.company.findUnique({
        where: { slug }
      });
      if (slugConflict) {
        return res.status(400).json({
          status: 'error',
          message: 'Company with this slug already exists'
        });
      }
    }

    const company = await prisma.company.update({
      where: { id: BigInt(companyId) },
      data: {
        name,
        slug,
        legalName,
        countryCode,
        timezone,
        plan,
        status
      }
    });

    // Audit log
    await auditFromRequest(req, {
      entity: 'company',
      entityId: company.id.toString(),
      action: 'UPDATE',
      diff: { ...req.body }
    });

    res.status(200).json({
      status: 'success',
      data: {
        id: company.id.toString(),
        name: company.name,
        slug: company.slug,
        legalName: company.legalName,
        countryCode: company.countryCode,
        timezone: company.timezone,
        plan: company.plan,
        status: company.status,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update company',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete company (super admin only)
 */
const deleteCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const userRole = req.user?.role;
    
    if (userRole !== 'super-admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Only super admins can delete companies'
      });
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: BigInt(companyId) }
    });

    if (!existingCompany) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found'
      });
    }

    // Delete company (cascade will handle related records)
    await prisma.company.delete({
      where: { id: BigInt(companyId) }
    });

    // Audit log
    await auditFromRequest(req, {
      entity: 'company',
      entityId: companyId,
      action: 'DELETE',
      diff: null
    });

    res.status(200).json({
      status: 'success',
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete company',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Search companies
 */
const searchCompanies = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'super-admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Only super admins can search companies'
      });
    }

    const { q, status, plan } = req.query;
    
    let where = {};
    
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { legalName: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (plan) {
      where.plan = plan;
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: {
          select: {
            companyUsers: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const transformedCompanies = companies.map(company => ({
      id: company.id.toString(),
      name: company.name,
      slug: company.slug,
      legalName: company.legalName,
      countryCode: company.countryCode,
      timezone: company.timezone,
      plan: company.plan,
      status: company.status,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      userCount: company._count.companyUsers
    }));

    res.status(200).json({
      status: 'success',
      data: transformedCompanies
    });
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search companies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  searchCompanies
};