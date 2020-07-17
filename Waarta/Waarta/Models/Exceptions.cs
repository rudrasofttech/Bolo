using System;
using System.Collections.Generic;
using System.Text;

namespace Waarta.Models
{
    public class NotFoundException : Exception
    {
    }

    public class ServerErrorException : Exception
    {
    }

    public class UnAuthorizedAccessException : Exception
    {
    }

    public class DuplicateDataException : Exception
    {
    }

    public class BadRequestException : Exception
    {
    }
}
